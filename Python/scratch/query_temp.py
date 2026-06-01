import urllib.request
import json
with urllib.request.urlopen('http://127.0.0.1:8000/pyapi/GetInvoiceDetails?invoiceid=89345') as response:
    print(json.loads(response.read().decode()))
