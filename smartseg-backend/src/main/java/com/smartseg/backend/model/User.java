package com.smartseg.backend.model;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "role", discriminatorType = DiscriminatorType.STRING)
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public abstract class User extends RestrictedUser {

    @Column(name = "role", insertable = false, updatable = false)
    private String role;
    @Column(nullable = false)
    private boolean enabled = false; // false by default until admin approves
}