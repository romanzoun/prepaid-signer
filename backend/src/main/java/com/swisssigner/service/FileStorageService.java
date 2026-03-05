package com.swisssigner.service;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${app.upload-dir:/tmp/swisssigner}")
    private String uploadDir;

    @PostConstruct
    public void init() throws IOException {
        Files.createDirectories(Paths.get(uploadDir));
    }

    public String store(MultipartFile file) throws IOException {
        String ref = UUID.randomUUID().toString();
        Path dest = Paths.get(uploadDir, ref + ".pdf");
        Files.copy(file.getInputStream(), dest, StandardCopyOption.REPLACE_EXISTING);
        return ref;
    }

    public void delete(String ref) {
        try {
            Files.deleteIfExists(Paths.get(uploadDir, ref + ".pdf"));
        } catch (IOException ignored) {}
    }

    public Path resolve(String ref) {
        return Paths.get(uploadDir, ref + ".pdf");
    }
}
