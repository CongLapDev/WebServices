package com.nhs.individual.service;

import com.cloudinary.Cloudinary;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Service
public class CloudinaryService {
    public static final Cloudinary cloudinary;
    static {
        Map<String,Object> config=new HashMap<String,Object>();
        config.put("cloud_name", "dvdjh1ezr");
        config.put("api_key", "485958284924162");
        config.put("api_secret", "2R45-ruN_N8xr2YiXwhf0bXhWCE");
        config.put("secure", true);
        cloudinary=new Cloudinary(config);

    }
    public Map upload(MultipartFile file){
        try {
            return cloudinary.uploader().upload(file.getBytes(),Map.of());
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

}
