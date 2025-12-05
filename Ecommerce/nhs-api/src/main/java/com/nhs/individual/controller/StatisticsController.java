package com.nhs.individual.controller;

import com.nhs.individual.service.sub_service.AccountStatisticService;
import com.nhs.individual.service.sub_service.OrderPerdayService;
import com.nhs.individual.service.sub_service.OverviewStatisticService;
import com.nhs.individual.service.sub_service.ProspectiveUserService;
import com.nhs.individual.specification.ISpecification.OrderPerDaySpecification;
import com.nhs.individual.views.Accountstatisticsview;
import com.nhs.individual.views.OrderPerDay;
import com.nhs.individual.views.OverviewStatistic;
import com.nhs.individual.views.Prospectiveuser;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.sql.Date;
import java.util.List;

@RestController
@RequestMapping(value = "/api/v1/statistic")
@AllArgsConstructor
public class StatisticsController {
    OrderPerdayService orderPerdayService;
    AccountStatisticService accountStatisticService;
    ProspectiveUserService prospectiveUserService;
    OverviewStatisticService overviewStatisticService;
    @GetMapping("/day/order")
    public List<OrderPerDay> getOrderStatisticPerDay(
            @RequestParam Date from,
            @RequestParam Date to
            ){
        if(from!=null && to!=null ){
            return orderPerdayService.findAll(OrderPerDaySpecification.between(from, to));
        }
        return orderPerdayService.findAll();
    }
    @GetMapping("/user")
    public Accountstatisticsview accountstatisticsview(){
        return accountStatisticService.findAll();
    }
    @GetMapping("/user/prospective")
    public List<Prospectiveuser> prospectiveuser(){
        return prospectiveUserService.findAll();
    }

    @GetMapping
    public OverviewStatistic overviewStatistic(){
        return overviewStatisticService.findAll().get(0);
    }

}
