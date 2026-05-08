package com.smartseg.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@DiscriminatorValue("DOCTOR")
@Getter @Setter
public class Doctor extends User {
    // viewSegmentation() and validateResult() will be in the service layer
}