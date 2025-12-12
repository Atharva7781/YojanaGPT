import requests, json

payload = {
  "query":"schemes for employment / skill development",
  "profile": {
    "state":"Maharashtra",
    "district":"Kolhapur",
    "gender":"male",
    "occupation":"Engineer",
    "monthly_income":20000
  },
  "top_k": 10
}

r = requests.post("http://127.0.0.1:8080/recommend", json=payload, timeout=30)
print(r.status_code)
try:
    print(json.dumps(r.json(), indent=2, ensure_ascii=False))
except Exception:
    print(r.text)
