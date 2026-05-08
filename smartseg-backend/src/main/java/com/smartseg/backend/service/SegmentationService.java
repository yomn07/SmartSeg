package com.smartseg.backend.service;

import com.smartseg.backend.dto.SegmentationResultResponse;
import com.smartseg.backend.exception.AccessDeniedException;
import com.smartseg.backend.exception.AlreadyExistsException;
import com.smartseg.backend.exception.ResourceNotFoundException;
import com.smartseg.backend.model.Doctor;
import com.smartseg.backend.model.MriScan;
import com.smartseg.backend.model.SegmentationResult;
import com.smartseg.backend.repository.DoctorRepository;
import com.smartseg.backend.repository.MriScanRepository;
import com.smartseg.backend.repository.SegmentationResultRepository;
import com.smartseg.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static org.springframework.expression.common.ExpressionUtils.toFloat;

@Service
public class SegmentationService {
    @Autowired
    private SegmentationResultRepository segmentationResultRepository;

    @Autowired
    private MriScanRepository mriScanRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DoctorRepository doctorRepository;
    @Autowired
    private RestTemplate restTemplate;
    private static final String FLASK_URL= "http://localhost:5000/segment";

    // Trigger segmentation
    public SegmentationResultResponse runSegmentation(
            Long scanId, String doctorEmail) {

        MriScan scan = mriScanRepository.findById(scanId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Scan not found with id: " + scanId));

        // Check doctor is assigned to this scan
        if (scan.getAssignedDoctor() == null ||
                !scan.getAssignedDoctor().getEmail().equals(doctorEmail)) {
            throw new AccessDeniedException(
                    "Access denied! This scan is not assigned to you.");
        }
        // Check if segmentation already exists
        if (segmentationResultRepository.findByMriScanId(scanId).isPresent()) {
            throw new AccessDeniedException(
                    "Segmentation already exists for this scan!");
        }

        // 4. Build Flask request body
        Map<String, Object> flaskRequest = new HashMap<>();
        flaskRequest.put("scan_id", scanId);
        flaskRequest.put("t1_path",   scan.getT1Path());
        flaskRequest.put("t2_path",   scan.getT2Path());
        flaskRequest.put("flair_path", scan.getFlairPath());
        flaskRequest.put("t1ce_path",  scan.getT1cePath());
        flaskRequest.put("slice_idx",  null);

        // 5. Call Flask
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity =
                new HttpEntity<>(flaskRequest, headers);
        ResponseEntity<Map> flaskResponse;
        try {
            flaskResponse = restTemplate.exchange(
                    FLASK_URL, HttpMethod.POST, entity, Map.class);
        } catch (Exception e) {
            throw new RuntimeException(
                    "Flask AI service unavailable: " + e.getMessage());
        }

        // 6. Parse Flask response
        Map<String, Object> body = flaskResponse.getBody();
        if (body == null || !"success".equals(body.get("status"))) {
            throw new RuntimeException(
                    "Segmentation failed: " + (body != null ? body.get("error") : "no response"));
        }

        String maskPath = (String) body.get("mask_path");
        Integer sliceUsed = (Integer) body.get("slice_used");

        @SuppressWarnings("unchecked")
        Map<String, Object> metrics = (Map<String, Object>) body.get("metrics");

        // 7. Save result to DB
        SegmentationResult result = new SegmentationResult();
        result.setMriScan(scan);
        result.setResultPath(maskPath);
        result.setValidated(false);

        result.setDscWT(toFloat(metrics.get("dscWT")));
        result.setDscTC(toFloat(metrics.get("dscTC")));
        result.setDscET(toFloat(metrics.get("dscET")));
        result.setIouWT(toFloat(metrics.get("iouWT")));
        result.setIouTC(toFloat(metrics.get("iouTC")));
        result.setIouET(toFloat(metrics.get("iouET")));
        result.setAccuracy((result.getDscWT() + result.getDscTC() + result.getDscET()) / 3);

        return toResponse(segmentationResultRepository.save(result));
    }
    // Helper: convert Number to float safely
    private float toFloat(Object val) {
        if (val instanceof Number) return ((Number) val).floatValue();
        return 0f;
    }
        /*SegmentationResult result = new SegmentationResult();
        result.setMriScan(scan);
        result.setResultPath("results/segmentation_" + scanId + ".nii.gz");
        result.setValidated(false);

        // Your ensemble metrics from the report ✅
        result.setDscWT(0.9141f);
        result.setDscTC(0.8632f);
        result.setDscET(0.7985f);
        result.setIouWT(0.8418f);
        result.setIouTC(0.7594f);
        result.setIouET(0.6646f);

        // Average DSC as overall accuracy
        result.setAccuracy((0.9141f + 0.8632f + 0.7985f) / 3);

        return toResponse(segmentationResultRepository.save(result));
    }*/
    // Get segmentation result by scan id
    public SegmentationResultResponse getResultByScanId(
            Long scanId, String doctorEmail) {

        MriScan scan = mriScanRepository.findById(scanId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Scan not found with id: " + scanId));

        // Check doctor is assigned
        if (scan.getAssignedDoctor() == null ||
                !scan.getAssignedDoctor().getEmail().equals(doctorEmail)) {
            throw new RuntimeException(
                    "Access denied! This scan is not assigned to you.");
        }

        SegmentationResult result = segmentationResultRepository
                .findByMriScanId(scanId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No segmentation result found for scan: " + scanId));

        return toResponse(result);
    }

    // Get all results for assigned doctor
    public List<SegmentationResultResponse> getResultsForDoctor(
            String doctorEmail) {

        Doctor doctor = (Doctor) userRepository.findByEmail(doctorEmail)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Doctor not found!"));

        return segmentationResultRepository
                .findByValidatedBy_Id(doctor.getId())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // Validate result
    public SegmentationResultResponse validateResult(
            Long resultId, String doctorEmail) {

        SegmentationResult result = segmentationResultRepository
                .findById(resultId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Result not found with id: " + resultId));

        Doctor doctor = (Doctor) userRepository.findByEmail(doctorEmail)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Doctor not found!"));

        result.setValidated(true);
        result.setValidatedBy(doctor);

        return toResponse(segmentationResultRepository.save(result));
    }

    // Invalidate result
    public SegmentationResultResponse invalidateResult(
            Long resultId, String doctorEmail) {

        SegmentationResult result = segmentationResultRepository
                .findById(resultId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Result not found with id: " + resultId));

        // Reset validation
        result.setValidated(false);
        result.setValidatedBy(null);

        // Re-run segmentation (mocked with slight variation)
        /*result.setDscWT(0.9141f);
        result.setDscTC(0.8632f);
        result.setDscET(0.7985f);
        result.setIouWT(0.8418f);
        result.setIouTC(0.7594f);
        result.setIouET(0.6646f);
        result.setAccuracy((0.9141f + 0.8632f + 0.7985f) / 3);
        result.setResultPath("results/segmentation_rerun_"
                + result.getMriScan().getId() + ".nii.gz");*/

        return toResponse(segmentationResultRepository.save(result));
    }

        // Convert to response
    public SegmentationResultResponse toResponse(SegmentationResult result) {
        SegmentationResultResponse response = new SegmentationResultResponse();
        response.setId(result.getId());
        response.setResultPath(result.getResultPath());
        response.setSegmentationDate(result.getSegmentationDate());
        response.setDscWT(result.getDscWT());
        response.setDscTC(result.getDscTC());
        response.setDscET(result.getDscET());
        response.setIouWT(result.getIouWT());
        response.setIouTC(result.getIouTC());
        response.setIouET(result.getIouET());
        response.setAccuracy(result.getAccuracy());
        response.setValidated(result.isValidated());

        if (result.getMriScan() != null) {
            response.setScanId(result.getMriScan().getId());
            if (result.getMriScan().getPatient() != null) {
                response.setPatientName(
                        result.getMriScan().getPatient().getName());
            }
        }

        if (result.getValidatedBy() != null) {
            response.setValidatedBy(result.getValidatedBy().getName());
        }

        return response;
    }
}
