import React from "react";
import Head from "./head";
import "./About.css";
import aboutImg from "./imgabout.png";
import storyImg from "./brain_tumor_header.jpg"; 
        

export default function About() {
  return (
    <div className="page">
      <Head loggedIn={false} />


      {/* Mission & Vision */}
      <section className="about-section">
        <h2>Our Mission & Vision</h2>
        <div className="about-content">
          <img src={storyImg} alt="Healthcare innovation" />
          <div className="text">
            <p>
              SmartSeg empowers healthcare professionals with state‑of‑the‑art
              AI tools to help interpret and segment MRI scans quickly and
              accurately. Our vision is to enhance diagnostic precision for the
              benefit of patients and clinicians worldwide.
            </p>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="about-section">
        <h2>Our Story</h2>
        <div className="about-content reverse">
          <div className="text">
            <p>
              Founded by a group of engineers ,
              SmartSeg began with the idea of combining AI with real medical
              expertise. From its first prototype to deployed systems helping
              real patients, our journey continues toward innovation in
              healthcare technology.
            </p>
          </div>
          <img src={aboutImg} alt="Team working together" />
        </div>
      </section>
    </div>
  );
}