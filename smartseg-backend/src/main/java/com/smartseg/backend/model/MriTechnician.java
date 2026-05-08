package com.smartseg.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@DiscriminatorValue("TECHNICIAN")
@Getter @Setter

public class MriTechnician extends User {
    // uploadMRI() will be in the service layer
}