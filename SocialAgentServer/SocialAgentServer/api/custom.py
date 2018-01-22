import math, csv, random
from api.models import Activity


def getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2):
    r = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.pow(math.sin(dlat / 2), 2) + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.pow(
        math.sin(dlon / 2), 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    d = r * c
    return d


def addActivitiesFromCsv(filename):
    reader = csv.DictReader(open(filename))
    for i in range(0, 52):
        row = reader.next()
        activity = Activity(
            charUnicode=unichr(int(row['unicode'])),
            color='#' + ''.join(random.choice('0123456789ABCDEF') for i in range(6)),
            name=row['name'],
            description=row['description']
        )
        activity.save()



