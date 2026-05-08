package com.smartseg.backend.model;
import lombok.*;
import jakarta.persistence.*;
@MappedSuperclass
@Data @NoArgsConstructor @AllArgsConstructor
public abstract class RestrictedUser {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String email;
    private String password;

}
