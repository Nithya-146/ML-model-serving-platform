package com.modeldock.controller;

import com.modeldock.dto.ModelCreateRequest;
import com.modeldock.dto.ModelDetailDto;
import com.modeldock.dto.ModelVersionDto;
import com.modeldock.service.ModelRegistryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/models")
@Tag(name = "Model Registry", description = "Model catalog, version management, and ONNX artifact uploads")
public class ModelRegistryController {

    private final ModelRegistryService registryService;

    public ModelRegistryController(ModelRegistryService registryService) {
        this.registryService = registryService;
    }

    @GetMapping
    @Operation(summary = "List all registered models and their active versions")
    public ResponseEntity<List<ModelDetailDto>> listModels() {
        return ResponseEntity.ok(registryService.getAllModels());
    }

    @GetMapping("/{name}")
    @Operation(summary = "Get detailed metadata, schemas, and version list for a model")
    public ResponseEntity<ModelDetailDto> getModel(@PathVariable String name) {
        return registryService.getModel(name)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{name}/versions")
    @Operation(summary = "List all versions and artifacts for a specific model")
    public ResponseEntity<List<ModelVersionDto>> getModelVersions(@PathVariable String name) {
        return ResponseEntity.ok(registryService.getModelVersions(name));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_DEVELOPER')")
    @Operation(summary = "Register or update a model and its version schema")
    public ResponseEntity<ModelDetailDto> createOrUpdateModel(@Valid @RequestBody ModelCreateRequest request) {
        return ResponseEntity.ok(registryService.createOrUpdateModel(request));
    }

    @PostMapping(value = "/{name}/versions/{version}/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_DEVELOPER')")
    @Operation(summary = "Upload ONNX binary model artifact for a specific version")
    public ResponseEntity<ModelVersionDto> uploadModelArtifact(
            @PathVariable String name,
            @PathVariable String version,
            @RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(registryService.uploadModelArtifact(name, version, file));
    }
}
