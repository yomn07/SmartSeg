package com.smartseg.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/results")
public class ImageController {

    private final String RESULTS_DIR = "C:/Users/DELL/Downloads/smartseg-backend/smartseg-ai/results/";

    @GetMapping("/{filename}")
    public ResponseEntity<Map<String, String>> getImageAsBase64(@PathVariable String filename) {
        try {
            Path filePath = Paths.get(RESULTS_DIR).resolve(filename).normalize();

            if (!Files.exists(filePath)) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "File not found");
                error.put("filename", filename);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }

            byte[] fileBytes = Files.readAllBytes(filePath);
            String base64Image = Base64.getEncoder().encodeToString(fileBytes);

            // Determine MIME type
            String mimeType = "image/png";
            if (filename.endsWith(".jpg") || filename.endsWith(".jpeg")) {
                mimeType = "image/jpeg";
            }

            Map<String, String> response = new HashMap<>();
            response.put("data", base64Image);
            response.put("mimeType", mimeType);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }
}