# -*- coding: utf-8 -*-
import httplib2, json

def get_card_description(name):
    name = name.replace(' ', '%20') # Replace raw spaces with encoded spaces
    endpoint = "https://omgvamp-hearthstone-v1.p.mashape.com/cards/search/" + name
    resp, content = (httplib2.Http()
							.request(endpoint,
							"GET",
	 						headers={"X-Mashape-Key": "nXfij7fxptmsh4p19dm15EMKKoQ3p1jXVZ4jsnkWWRD7nA6xWn"}))
    content_object = content.decode('utf-8')
    data = json.loads(content_object)
    if isinstance(data, list):
        for item in data:
			#A gold version of a card ensures that card is indeed a card and not an enchantment.
            if 'imgGold' in item and 'cost' in item:
                name = item['name'] if 'name' in item else ''
                # Replacements of characters are for special formating characters in the text that we do not need
                text = (item['text'].replace("<b>", '')
								   .replace('</b>', '')
								   .replace('$', '')
								   .replace('#', '') if 'text' in item else '')
                img = item['imgGold'] if 'imgGold' in item else ''
                cost = str(item['cost']) + " Mana" if 'cost' in item else ''
                stats = (str(item['attack']) + "/" + str(item['health'])
						 if ('attack' in item and 'health' in item) else '')
                return name + " - " + text + " - " + img + " - " + cost + " - " + stats
    return None
