package com.nhs.individual.zalopay.model;
import com.nhs.individual.utils.Jsonable;

public class EmbedData implements Jsonable {
    private String[] preferred_payment_method;
    private String redirecturl;
    // Json
    private String columninfo;
    //Json (watch Campaign Code)
    private String promotioninfo;
    //Json {"zlppaymentid": "P4201372"}
    private String zlppaymentid;

}
