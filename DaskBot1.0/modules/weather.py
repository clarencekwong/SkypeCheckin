# -*- coding: utf-8 -*-
import httplib2, json

def get_temperature(city, country):
    try:
        url = 'http://api.openweathermap.org/data/2.5/weather?q='
        key = '0fae4818086cf9aaf84fd49efd93cb88' #Should hide this ; ]
        resp, content = httplib2.Http().request(url + city.replace(' ', '%20') + "," +
                                                country.replace(' ', '%20') + '&appid=' + key, "GET")
        content_object = content.decode('utf-8')
        data = json.loads(content_object)
        return (" >> " + city.title() + "'s current temperature is: " +
                str(round((data['main']['temp'] - 273.15), 0)) + u" °C")
    except:
        return "Unable to get weather data."
