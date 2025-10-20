Planet Stories Data Access


This describes some ways to access the data backing www.planet.com/stories
Metadata
You can get metadata about existing Planet Stories from this endpoint
https://api.planet.com/explorer/t2/animations
Response Format
The JSON response will have these fields
data: array of story metadata objects
more: bool indicating if there are more stories to page through
Sort Order
The results come in order of story creation time, descending. This means the most recently created stories are returned first in this API.
Pagination
To page through more results, you can use a “before” query parameter with the oldest story from a previous returned set, e.g. 
There is also a `limit` param that can be used:
https://api.planet.com/explorer/t2/animations?limit=3
https://api.planet.com/explorer/t2/animations?limit=3&before=earthquake_2017-Mmm7iE6NR 
Story View
With a given story ID you can look at the individual story viewer at
https://www.planet.com/stories/<ID>
https://www.planet.com/stories/nechi-1RrjoL6HR


