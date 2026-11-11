package com.smartseg.backend.controller;

import com.smartseg.backend.model.User;
import com.smartseg.backend.repository.UserRepository;
import com.smartseg.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
//@CrossOrigin(origins = "http://localhost:3000")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private UserService userService;
    // get all users
    @GetMapping("/users/all")
    public ResponseEntity<List<User>> getAllUsersRegardlessOfStatus() {
        return ResponseEntity.ok(userService.getAllUsersRegardlessOfStatus());
    }
    // Get all pending users
    @GetMapping("/pending")
    public ResponseEntity<List<User>> getPendingUsers() {
        return ResponseEntity.ok(userService.getPendingUsers());
    }

    // Get all approved users
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getApprovedUsers());
    }

    // Approve a user
    @PutMapping("/approve/{id}")
    public ResponseEntity<?> approveUser(@PathVariable Long id) {
        User approved = userService.approveUser(id);
        return ResponseEntity.ok(Map.of(
                "message", "User " + approved.getName() + " approved successfully!",
                "user", approved
        ));
    }

    // Reject a user
    @PutMapping("/reject/{id}")
    public ResponseEntity<?> rejectUser(@PathVariable Long id) {
        userService.rejectUser(id);
        return ResponseEntity.ok(Map.of(
                "message", "User rejected and removed successfully!"
        ));
    }

    // Delete a user
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(Map.of(
                "message", "User deleted successfully!"
        ));
    }
    //Metrics Evaluation part
    @GetMapping("/metrics/overall")
    public ResponseEntity<Map<String,Object>> getOverallMetrics(){
        Map<String,Object> metrics= new HashMap<>();
        //  ensemble results
        Map<String,Double> dsc = new HashMap<>();
        dsc.put("wholeTumor", 0.9141);
        dsc.put("tumorCore",0.8632);
        dsc.put("enhancingTumor", 0.7985);
        dsc.put("average",(0.9141+0.8632+0.7985)/3);

        Map<String,Double> iou = new HashMap<>();
        iou.put("wholeTumor",0.8418);
        iou.put("tumorCore",0.7894);
        iou.put("enhancingTumor",0.6646);
        iou.put("average",(0.8418+0.7594+0.6646)/3);

        metrics.put("dsc",dsc);
        metrics.put("iou",iou);

        //Per-class performance
        Map<String,Object> perClass = new HashMap<>();
        Map<String,Double> necrosis = new HashMap<>();
        necrosis.put("dsc",0.7985);
        necrosis.put("iou",0.6646);
        perClass.put("necrosis", necrosis);

        Map<String,Double> edema = new HashMap<>();
        edema.put("dsc",0.8947);
        edema.put("iou",0.8095);
        perClass.put("edema",edema);

        Map<String,Double> enhancingTumor = new HashMap<>();
        edema.put("dsc", 0.7985);
        edema.put("iou",0.6646);
        perClass.put("enhancingTumor",enhancingTumor);

        metrics.put("perClass",perClass);

        //Model information
        Map<String,Object> modelInfo = new HashMap<>();
        modelInfo.put("architecture", "Attention Res-UNet with Guided Decoder (ARU-GD)");
        modelInfo.put("ensembleStrategy", "Probability Averaging Ensemble (3 Models)");
        modelInfo.put("dataset","BraTS 2019");
        modelInfo.put("trainingSamples",4700);
        modelInfo.put("testSamples",1000);
        metrics.put("modelInfo",modelInfo);
        return ResponseEntity.ok(metrics);
    }
    // Get metrics by tumor region
    @GetMapping("/metrics/by-region")
    public ResponseEntity<Map<String,Object>> getMetricsByRegion(){
        Map<String,Object> regionMetrics = new HashMap<>();

        //Whole Tumor (WT)
        Map<String,Double> wholeTumor = new HashMap<>();
        wholeTumor.put("dsc",0.9141);
        wholeTumor.put("iou", 0.8418);
        regionMetrics.put("wholeTumor",wholeTumor);

        //Tumor Core (TC)
        Map<String,Double> tumorCore = new HashMap<>();
        tumorCore.put("dsc",0.8632);
        tumorCore.put("iou",0.7594);
        regionMetrics.put("tumorCore",tumorCore);

        //Enhancing Tumor (ET)
        Map<String,Double> enhancingTumor = new HashMap<>();
        enhancingTumor.put("dsc",0.7985);
        enhancingTumor.put("iou", 0.6646);
        regionMetrics.put("enhancingTumor",enhancingTumor);
        return ResponseEntity.ok(regionMetrics);
    }
    // Get training performance summary
    @GetMapping("/metrics/training-summary")
    public ResponseEntity<Map<String,Object>> getTrainingSummary(){
        Map<String,Object> summary = new HashMap<>();

        Map<String, Object> baseline = new HashMap<>();
        baseline.put("dscWT", 0.9045);
        baseline.put("dscTC", 0.8750);
        baseline.put("dscET", 0.7789);
        baseline.put("avgEpochTime", "192.3s");
        summary.put("baselineARUGD", baseline);

        Map<String, Object> cbam = new HashMap<>();
        cbam.put("dscWT", 0.9037);
        cbam.put("dscTC", 0.8503);
        cbam.put("dscET", 0.7820);
        cbam.put("avgEpochTime", "175.6s");
        summary.put("arugdWithCBAM", cbam);

        Map<String, Object> cbamFocal = new HashMap<>();
        cbamFocal.put("dscWT", 0.8947);
        cbamFocal.put("dscTC", 0.8097);
        cbamFocal.put("dscET", 0.7806);
        cbamFocal.put("avgEpochTime", "269.7s");
        summary.put("cbamWithFocalLoss", cbamFocal);

        Map<String, Object> ensemble = new HashMap<>();
        ensemble.put("dscWT", 0.9141);
        ensemble.put("dscTC", 0.8632);
        ensemble.put("dscET", 0.7985);
        ensemble.put("improvement", "Best performing configuration");
        summary.put("probabilityAveragingEnsemble", ensemble);

        return ResponseEntity.ok(summary);
    }

}
