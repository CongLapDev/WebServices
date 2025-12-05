package com.nhs.individual.specification;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class DynamicSearch {
    private   String key;
    private Object value;
    private Operator operation;
    public enum Operator{
        LT("lt"),
        GT("gt"),
        LTE("lte"),
        GTE("gte"),
        LIKE("like"),
        IN("in"),
        EQUALS("eq");
        public final String value;
        Operator(String value){
            this.value=value;
        }
    }
}
