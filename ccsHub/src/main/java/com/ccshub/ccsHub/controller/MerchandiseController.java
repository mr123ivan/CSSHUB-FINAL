package com.ccshub.ccsHub.controller;

import com.ccshub.ccsHub.entity.Merchandise;
import com.ccshub.ccsHub.entity.MerchandiseDto;
import com.ccshub.ccsHub.repository.MerchandiseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/merchandises")
public class MerchandiseController {

    @Autowired
    private MerchandiseRepository repo;

    @GetMapping
    public ResponseEntity<List<Merchandise>> getMerchandise() {
        List<Merchandise> merchandises = repo.getMerchandise();
        return ResponseEntity.ok(merchandises);
    }

    @PostMapping("/create")
    public ResponseEntity<Merchandise> createMerchandise(
            @RequestParam("name") String name,
            @RequestParam("description") String description,
            @RequestParam("price") double price,
            @RequestParam("stock") int stock,
            @RequestParam(value = "imageFile", required = false) MultipartFile imageFile) {

        Merchandise merchandise = new Merchandise();
        merchandise.setName(name);
        merchandise.setDescription(description);
        merchandise.setPrice(price);
        merchandise.setStock(stock);

        try {
            if (imageFile != null && !imageFile.isEmpty()) {
                merchandise.setImage(imageFile.getBytes());
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        repo.createMerchandise(merchandise);
        return ResponseEntity.ok(merchandise);
    }

    @GetMapping("/image/{id}")
    public ResponseEntity<byte[]> getImage(@PathVariable int id) {
        Merchandise merchandise = repo.getMerchandise(id);
        byte[] image = merchandise.getImage();
        return ResponseEntity.ok().contentType(MediaType.IMAGE_JPEG).body(image);
    }

    @PutMapping("/edit/{id}")
    public ResponseEntity<Merchandise> updateMerchandise(
            @PathVariable int id,
            @RequestParam("name") String name,
            @RequestParam("description") String description,
            @RequestParam("price") double price,
            @RequestParam("stock") int stock,
            @RequestParam(value = "imageFile", required = false) MultipartFile imageFile) {

        Merchandise merchandise = repo.getMerchandise(id);
        if (merchandise == null) {
            return ResponseEntity.notFound().build();
        }

        merchandise.setName(name);
        merchandise.setDescription(description);
        merchandise.setPrice(price);
        merchandise.setStock(stock);

        try {
            if (imageFile != null && !imageFile.isEmpty()) {
                merchandise.setImage(imageFile.getBytes());
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        repo.updateMerchandise(merchandise);
        return ResponseEntity.ok(merchandise);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteMerchandise(@PathVariable int id) {
        repo.deleteMerchandise(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<Merchandise>> searchMerchandise(@RequestParam("keyword") String keyword) {
        List<Merchandise> merchandises = repo.searchMerchandise(keyword);
        return ResponseEntity.ok(merchandises);
    }
}
