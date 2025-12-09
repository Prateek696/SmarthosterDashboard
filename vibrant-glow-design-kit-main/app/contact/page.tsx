'use client';

import Layout from "@/components/Layout";
import ContactForm from "@/components/ContactForm";

export default function ContactPage() {
  const seoData = {
    title: "Contact Us - SmartHoster.io",
    description: "Get in touch with our property management experts. Contact SmartHoster.io for personalized consultation and support.",
    canonicalUrl: "/contact"
  };

  return (
    <Layout customSEO={seoData}>
      <ContactForm />
    </Layout>
  );
}

