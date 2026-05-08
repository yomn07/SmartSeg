package com.smartseg.backend.model;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "administrator")
@Getter @Setter
public class Administrator extends RestrictedUser {

    // Enforce only one row ever exists
    @Column(unique = true, nullable = false)
    private static final String SINGLETON_KEY = "ADMIN";
}