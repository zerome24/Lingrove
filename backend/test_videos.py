import urllib.request
import json
import socket

socket.setdefaulttimeout(3)

ids = [
    'Jc_Vq8y6yU8', '1xGk4c4d29s', '8q2gZ6Fh_Xw', 'b4wH9FvG0a8', 'Q7Z3L7s4V2E', 'd_k8zZ6qA10',
    '1sz1AlNKzUs', 'LJ2l_QvtfNY', '7vCeeOWfuAY', 'cg-0mUvIg_k', 'rvja5Y2Mj_A', 'MH3Pv1Aulk8',
    'qI27XVrPhlA', 'mQIi3buLii4', 'i2Sx2nKQV6I', 'Ax2iLVLeVK4', 'uRPyHN2vYA4', 'Zc7G5eN4N3g',
    'Y7XpBSNaR9w', 'hT3w5NgbOf8', 'EvrgzATwJ50'
]

for vid in ids:
    url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={vid}&format=json"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())
            print(f"OK: {vid} | {data.get('title')}")
    except Exception as e:
        print(f"FAIL: {vid} | {e}")
