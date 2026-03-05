package com.swisssigner.model;

import java.io.Serializable;

public class PriceBreakdown implements Serializable {
    private double perSignature;
    private double perSignatureGross;
    private int count;
    private boolean analysisRequested;
    private double analysisNet;
    private double analysisGross;
    private double subtotal;
    private double tax;
    private double total;
    private String currency;

    public PriceBreakdown() {}

    public PriceBreakdown(double perSignature, int count, double subtotal, double tax, double total, String currency) {
        this(perSignature, 0.0, count, false, 0.0, 0.0, subtotal, tax, total, currency);
    }

    public PriceBreakdown(double perSignature, double perSignatureGross, int count, double subtotal, double tax, double total, String currency) {
        this(perSignature, perSignatureGross, count, false, 0.0, 0.0, subtotal, tax, total, currency);
    }

    public PriceBreakdown(double perSignature,
                          double perSignatureGross,
                          int count,
                          boolean analysisRequested,
                          double analysisNet,
                          double analysisGross,
                          double subtotal,
                          double tax,
                          double total,
                          String currency) {
        this.perSignature = perSignature;
        this.perSignatureGross = perSignatureGross;
        this.count = count;
        this.analysisRequested = analysisRequested;
        this.analysisNet = analysisNet;
        this.analysisGross = analysisGross;
        this.subtotal = subtotal;
        this.tax = tax;
        this.total = total;
        this.currency = currency;
    }

    public double getPerSignature() { return perSignature; }
    public void setPerSignature(double perSignature) { this.perSignature = perSignature; }
    public double getPerSignatureGross() { return perSignatureGross; }
    public void setPerSignatureGross(double perSignatureGross) { this.perSignatureGross = perSignatureGross; }
    public int getCount() { return count; }
    public void setCount(int count) { this.count = count; }
    public boolean isAnalysisRequested() { return analysisRequested; }
    public void setAnalysisRequested(boolean analysisRequested) { this.analysisRequested = analysisRequested; }
    public double getAnalysisNet() { return analysisNet; }
    public void setAnalysisNet(double analysisNet) { this.analysisNet = analysisNet; }
    public double getAnalysisGross() { return analysisGross; }
    public void setAnalysisGross(double analysisGross) { this.analysisGross = analysisGross; }
    public double getSubtotal() { return subtotal; }
    public void setSubtotal(double subtotal) { this.subtotal = subtotal; }
    public double getTax() { return tax; }
    public void setTax(double tax) { this.tax = tax; }
    public double getTotal() { return total; }
    public void setTotal(double total) { this.total = total; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
}
