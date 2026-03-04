package com.swisssigner.model;

import java.io.Serializable;

public class PriceBreakdown implements Serializable {
    private double perSignature;
    private int count;
    private double subtotal;
    private double tax;
    private double total;
    private String currency;

    public PriceBreakdown() {}

    public PriceBreakdown(double perSignature, int count, double subtotal, double tax, double total, String currency) {
        this.perSignature = perSignature;
        this.count = count;
        this.subtotal = subtotal;
        this.tax = tax;
        this.total = total;
        this.currency = currency;
    }

    public double getPerSignature() { return perSignature; }
    public void setPerSignature(double perSignature) { this.perSignature = perSignature; }
    public int getCount() { return count; }
    public void setCount(int count) { this.count = count; }
    public double getSubtotal() { return subtotal; }
    public void setSubtotal(double subtotal) { this.subtotal = subtotal; }
    public double getTax() { return tax; }
    public void setTax(double tax) { this.tax = tax; }
    public double getTotal() { return total; }
    public void setTotal(double total) { this.total = total; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
}
