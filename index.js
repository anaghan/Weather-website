import express from 'express';
import bodyParser from 'body-parser';
import axios from 'axios';
import unixTimestamp from 'unix-timestamp';
import country from 'i18n-iso-countries';
import env from "dotenv";

env.config();

const app=express();
const api_key=process.env.API;
const API_URL="https://api.openweathermap.org/data/2.5/weather";
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.get("/",(req,res)=>{
    res.render("index.ejs");
});
app.post("/weather",async (req,res)=>{
    var loc=req.body["location"];
    try{
        const response=await axios.get(API_URL,{params:{
            "q":loc,
            "appid":api_key
        }});
        var countryCode=response.data.sys.country;
        var title=response.data.name+', '+country.getName(countryCode,"en");
        var desc=response.data.weather[0].description.slice(0,1).toUpperCase()+response.data.weather[0].description.slice(1);
        var temp=((response.data.main.temp)-273.15).toFixed(2);
        var feels_like=((response.data.main.feels_like)-273.15).toFixed(2);
        var icon=response.data.weather[0].icon;
        var time_offset=(response.data.timezone);
        var timestamp=unixTimestamp.now(time_offset);
        var city_timestamp=unixTimestamp.toDate(timestamp);
        var city_date=city_timestamp.toUTCString();
        var day=city_date.slice(0,3);
        var mon=city_date.slice(5,7);
        var date=city_date.slice(8,11);
        var year=city_date.slice(12,16);
        var humidity=response.data.main.humidity;
        var wind=(response.data.wind.speed*3.6).toFixed(2);
        var pressure=response.data.main.pressure;
        var precipitation;
        if (typeof(response.data.rain)!="undefined"){
            precipitation=response.data.rain["1h"];
        }
        else{
            precipitation=0;
        }
        const img_url="https://openweathermap.org/img/wn/"+icon+"@2x.png";
        res.render("weather_info.ejs",{weather_desc:desc,weather_icon:img_url,weather_title:title,weather_temp:temp,weather_feels_like:feels_like,city_day:day,city_mon:mon,city_date:date,city_year:year,humidity:humidity,prec:precipitation,windSpeed:wind,pressure:pressure});
    }
    catch(error){
        console.log(error);
        if (error.response.status=='404'){
            res.render("index.ejs",{error_msg:"City not found"});
        }
        else if(error.response.status=='400'){
            res.render("index.ejs",{error_msg:"Please enter a city"});
        }
        else{
            res.render("index.ejs",{error_msg:"Please try again, or come back later"});
        }
    }
});
app.listen(3000,()=>{
    console.log("Server is running");
});