---
slug: "2026-11-chinese-cameras-internet.en"
title: "What Chinese cameras do on the internet"
language: "en"
translationKey: "chinese-cameras-internet"
publishedAt: "2026-11-20"
summary: "I measured what two Jooan Wi-Fi cameras try to reach on the internet, what happens when the IoT network loses its way out, and how they ended up working on the local network alone, with one narrow exception to Google."
tags: ["homelab", "iot", "openwrt", "home-assistant", "privacy"]
category: "Homelab"
---

In the [[2026-11-low-cost-homelab-setup.en|post about my homelab]] I said the IoT network no longer reaches the internet, with one exception: the cameras can open HTTPS to Google. I promised to explain that exception in a separate post, and this is it.

I have two **Jooan** Wi-Fi cameras at home, a W3-U and a W5-U, used through the cam720 app on my phone. The cameras' login page points to `policy.qacloud.com.cn`, so the cloud behind the app seems to be "qacloud". I suspected they were sending images to the vendor's cloud without my asking.

| ![[att-20261120105307089.png]] | ![[att-20261120104934624.png]] |
| :---: | :---: |
| W5-U | W3-U |

*The two Jooan cameras. Each has two lenses, one that moves (PTZ) and one fixed.*

I measured what they try to reach and what happens when they lose the internet. They work on the local network alone, but they won't accept having no internet at all: every minute and a half they drop their own Wi-Fi until they manage to open a connection to Google.

## How it started

When I fully blocked the IoT network's way out to the internet and tried to pair a camera on it with cam720, the app failed with "Device binding failed". The Wi-Fi connected and the camera got an address, but the link to the account never completed.

That makes sense: binding registers the camera in the vendor's cloud, and with no internet there is no cloud. But if pairing depends on the cloud, what else depends on it, and what leaves my house while it's on?

That made me want to dig in until my privacy and security questions were answered. Everything below was measured on my [OpenWrt](https://openwrt.org/) router, with two cameras, over a few days. It's a small sample from a single brand. Don't take it as a result for other brands, but do take the process I used, and try running it on other cameras.

## How I measured

I didn't use tcpdump or Wireshark. All of the network traffic data came from the router itself, over SSH, with what OpenWrt ships with. Since the cameras are on the router's Wi-Fi, every packet they send goes through it, and that was enough to see where they go and how much they send.

These were the tools:

- **conntrack**: the connection table the Linux kernel keeps for the firewall (netfilter's *connection tracking*). Each line is a flow, with source, destination, ports, state, and packet and byte counters in both directions (OpenWrt turns that accounting on by default). I read it straight from `/proc/net/nf_conntrack`, filtered by the camera's address.
- **dnsmasq DNS log**: dnsmasq is OpenWrt's DNS and DHCP server. With the `logqueries` option on, it records every name a device asks it for. A device that talks directly to another DNS server, or connects to a fixed address, bypasses this log.
- **Wi-Fi log**: hostapd, which runs the access point, writes an `AP-STA-DISCONNECTED` line every time a device drops. I counted those lines per camera.
- **Firewall rule with logging**: a temporary rule that drops and records what the camera tries to send to the internet. It shows attempts that never became a connection, which conntrack doesn't show.
- **nftables**: after the first test, which opened the whole internet to one camera, the test allowances used nftables address sets (`nft add element`), with a rule that only lets the camera talk to what's in the set.

I read the three logs with `logread`, OpenWrt's system log reader. For video I used `ffprobe` and `mpv`, and for ONVIF, `curl` and small Python scripts with hand-built SOAP messages. I wrapped it all in bash scripts. The test ones take a backup first, apply the change and undo it at the end.

The difference from tcpdump is what you can see. Conntrack shows who talked to whom and how many bytes went through, but not the content. For this question, that's enough. To know what goes inside a connection, you'd have to capture the packets, and even then, over HTTPS, the content is encrypted.

> To measure what an IoT device does on the network, the router already has almost everything: the connection table, the DNS log and the Wi-Fi log.

## The block that didn't block

The first step was to turn off forwarding from the IoT network to the WAN in the OpenWrt firewall. I checked the ruleset, pulled the camera's video over the local network, and called the test passed.

It wasn't. Conntrack still showed live flows from the W3-U to public addresses, going out through the WAN. One of them, over UDP, had about 270 thousand packets and 60 MB sent.

The cause is at the start of the `forward` chain, in a rule that accepts connections already established (`ct state established,related`). A connection opened before the change keeps passing, and the camera's *keepalives* (periodic packets that keep a connection alive) renew it indefinitely. The W5-U, which joined the network after the block, had no outbound flow at all.

The ruleset and the local video test looked right. Only conntrack showed the problem. I unplugged the W3-U and plugged it back in (on the first try it was slow to come back to the network and the test didn't count, so it took two more). Then I checked twice, two minutes apart: zero flows to public addresses, and local video working.

> Blocking new traffic doesn't kill old connections. After changing the firewall, check conntrack or restart the device.

## Where they try to go

With the way out blocked, I turned on the router's DNS query log for 6 minutes and restarted both cameras. Since there was no internet, what shows up are only attempts.

| Name looked up | W3-U | W5-U | What it appears to be |
| --- | --- | --- | --- |
| `use1mqtt.jooaniot.com` | 209 | 184 | The vendor's MQTT message channel, US East region |
| `use1api.jooaniot.com` | 62 | 5 | The vendor's cloud API |
| `us-east-1-jooan-thn.s3.us-east-1.amazonaws.com` and a second S3 name | 0 | 27 | An Amazon S3 bucket named after Jooan |
| `oss-us-east-1.aliyuncs.com` | 0 | 3 | Alibaba Cloud storage |
| two names under `iotcplatform.com`, one with "tutk" in it | 0 | 3 | ThroughTek's (TUTK) P2P platform, which brokers the connection and relays it if needed |
| `www.google.com`, `www.facebook.com`, `www.tencent.com`, `www.aliyun.com` | 1 each (aliyun 2) | 1 each | The camera's own "is there internet?" check |

The right-hand column is my reading of the names, not confirmed by the vendor. The MQTT name (`use1mqtt.jooaniot.com`) was looked up roughly every 3 seconds.

The W3-U didn't look up the storage and relay names in that window. The likely explanation is that it wasn't linked to cloud storage, and the W5-U was.

In other words: as they come from the factory, these cameras are ready to send data to the vendor's cloud, to an Amazon bucket, to an Alibaba bucket and to a *relay* service. I didn't measure the content of any of it, because the block stopped the connections. But the destinations exist, and the block closes all of them.

## Without internet, the Wi-Fi drops every minute and a half

In the router's Wi-Fi log, over 81 minutes, the W3-U disconnected 48 times and the W5-U 43 times. All the other devices together: 7, all from one phone. Each drop leaves a 12 to 15 second gap in the video.

Signal doesn't explain it: the cameras were between -24 and -40 dBm, with noise at -74 dBm.

To test the idea that the lack of internet causes the drops, I opened the internet to the W3-U alone for about 12 minutes and left the W5-U blocked as a control. The W3-U stopped dropping during the window. The W5-U kept dropping, roughly every minute and a half. When I removed the rule and restarted the W3-U, it started dropping again.

That was one camera, in a 12-minute window, with the other as control. The sample is small, but the effect was clear: without internet, they restart their Wi-Fi in a loop.

## What the camera actually needs

The next question was the minimum internet access that ends the loop. I wrote a script that allows, for a fixed time and for one camera only, a small set of addresses, and shows both cameras' drops every minute.

OpenWrt's default `dnsmasq` package is built without nftset support (`dnsmasq-full` has it), so it doesn't fill an address set from DNS answers. The script resolves the names on the router itself every 10 seconds and adds the addresses to the set.

### The W3-U: HTTPS to Google or to Aliyun

The results, in the order they happened:

1. The four sites only (Google, Facebook, Tencent, Aliyun): the drops continued, and the camera opened no connection to any allowed address. At the time I thought it was because it only checks at boot. Later I saw it repeats the check on its own, so this run is still unexplained (maybe it got a different Aliyun address).
2. The vendor only: the drops stopped, but the run didn't count. When it reloads its configuration, the OpenWrt firewall doesn't delete an address set that was removed from it, so the four sites from the previous run were still allowed. I fixed the script to delete the set at the start and at the end.
3. The four sites only, clean set: the drops stopped after the fourth minute. The camera opened a single HTTPS connection, to Aliyun.
4. `www.aliyun.com` only, 20 minutes: it stopped. After the rule was removed, it went back to dropping at the same rhythm as before.
5. `www.google.com` only, 20 minutes: it stopped too. Three connections to Google on port 443, none anywhere else.

Conclusion for the W3-U: it stays stable if it can open HTTPS to Google or to Aliyun, with the vendor, the buckets and the relay blocked. And it repeats the check all the time, so the allowance has to be permanent.

I chose Google because its eight addresses stayed the same across about 75 minutes of tests, and Aliyun's changed in the middle of a run.

### The W5-U: five public DNS servers, by address

With the same rule, the W5-U kept dropping and opened no connection to Google. Restarting it changed nothing.

So I turned on a log of its blocked attempts alone. In 10 minutes, it tried TCP 443 on five public DNS server addresses, without looking up any name first: `8.8.8.8` (Google), `223.5.5.5` and `223.6.6.6` (AliDNS), `180.76.76.76` (Baidu) and `114.114.114.114` (114DNS). About 150 attempts per address.

After about 45 minutes in the loop following a boot, it would switch on its own to the Google check and settle down. With `8.8.8.8:443` allowed at boot time, it never entered the loop. That was one run each way, so it's a strong hint, not yet proof.

### What goes over those connections

The permanent rule ended up like this: both cameras can open TCP 443 to eight Google addresses and to `8.8.8.8`. A script on the router updates the set every minute, but only accepts addresses inside a list of ranges I believe are Google's, so a fake DNS answer can't widen the rule. That list was put together from memory and I haven't checked it yet.

The obvious question is whether the video goes to Google. Going by conntrack's counters, almost every camera connection to Google had 216 bytes sent and 112 received. That's four small packets out and two back: opening and closing a TCP connection with no data inside, not even the start of a TLS session.

Some had one extra acknowledgement packet (164 received, or 268 sent). One had 372 sent and 332 received, and I haven't explained that one yet. The counters don't show content; a tcpdump capture at that moment would have shown whether the extra bytes were data or repeated packets.

The limit of the measurement: I looked at a few minutes of traffic, and the rule would let the camera send anything to those addresses. But nothing suggests it does, and the storage destinations it looks for are others, all blocked.

> As far as I measured, these cameras' internet check opens and closes a TCP connection without sending data. It doesn't need the vendor's cloud to stay stable.

## What works on the local network alone

With the loop solved, I can watch the cameras without the cloud.

- Local RTSP: both serve H.264 video at 2304x1296 and 15 fps on port 554, with a *digest* login I set. `live/ch00_0` is the lens that moves (PTZ), `live/ch01_0` is the fixed lens, and the W5-U has 640x360 sub-streams on `ch00_1` and `ch01_1`.
- Home Assistant: four generic RTSP cameras on a dashboard. From the services network, a single firewall rule lets only Home Assistant start connections into the IoT network.
- ONVIF, halfway: port 8899 answers and accepts the same login, but Home Assistant's ONVIF integration doesn't work with these cameras. The camera only understands SOAP messages with certain namespace prefixes, and the library Home Assistant uses writes `ns0:`. In XML the prefix shouldn't matter, so the bug is the camera's. I tested the same call with curl: with the `tds:` prefix it answers 200, with `ns0:` it answers 400. Moving the lens (PTZ) works through a small script of mine, called by Home Assistant.
- Saved positions: they don't exist. The camera answers that it supports neither `SetPreset` nor a home position.

### The clock goes back to 2021

Without internet, the camera loses the time at every power cut and starts counting from November 11, 2021, at midnight, in the US Pacific time zone.

I tried to fix it with an NTP server on the router. It didn't work: the camera didn't ask for DHCP again at boot, and over ONVIF it accepts a new NTP server with "200 OK" and changes nothing. The stored server is `time.windows.com`, and in 10 minutes it sent no NTP packet anywhere.

What works is setting the time manually over ONVIF, with the Brazil time zone. That lasts until the next power cut, which wipes the time, the type and the zone. So Home Assistant does it: every 5 minutes it reads the cameras' clocks and, if one is wrong, sets the time with the Brazil time zone. After a power cut, the wrong time lasts about 5 minutes.

## What about replacing the firmware?

I considered replacing the firmware with an open one, such as [OpenIPC](https://openipc.org/). It would fix the root of the problem: without the vendor's firmware, there's no internet check and no cloud.

I left it as a last resort. It requires identifying the chip and accepting the risk of bricking the camera. On some models it installs through the factory update itself, on others you have to open the device, which wouldn't be a problem for me, but would be more work. Since the original firmware works offline with the Google exception, the cost wasn't worth it for now.

## Which camera I'd buy today

For anyone who wants cameras at home without sending video to anyone's cloud, my order would be this:

1. Cameras with documented RTSP and ONVIF that work without a cloud, on an isolated network. It's the simplest path if the camera really works offline. Test before trusting it: block the internet, restart, and watch **conntrack** and the Wi-Fi log for an hour.
2. A DVR or NVR with wired cameras. It makes sense when you can run cable and the recorder also stays off the internet. Recording lives in one place and works without Wi-Fi. In my case, an old rented apartment, it isn't worth it.
3. "Cheap" Chinese cameras, like mine, on an IoT network with no internet and one narrow exception. It works, as I showed, but it takes effort, and each model may have a different check. The W3-U and the W5-U are the same brand and don't check the same way.
4. Cameras with replaced firmware (OpenIPC or similar). For people who accept opening the device and losing the warranty, and when the model is supported.

Either way, cameras go on a separate network, with no access to the other networks in the house. Without internet, mine get no firmware updates, and their web server is old, with a weak login.

## Next steps

- A fake service for the check. Since the camera only opens and closes a TCP connection, a local server that accepts connections on port 443 may be enough. The plan is to point one of the check's names (`www.aliyun.com`) at it in local DNS and remove the Google exception, if the camera accepts the local answer. If it works, that solves the W3-U. The W5-U first checks fixed addresses, such as `8.8.8.8`, without DNS, and only then moves to the check by name, so it still needs a solution.
- Other brands. I'll buy cameras from other manufacturers and repeat the same tests, to see whether this behavior is Jooan's or common among cheap cameras.
- Recording to the SD card, with motion clips showing up in Home Assistant.

## Conclusion

These cameras were built to live in the vendor's cloud, and they look for it all the time: MQTT, API, buckets on Amazon and Alibaba, relay. With no internet at all, they drop their own Wi-Fi every minute and a half.

With the IoT network blocked and one TCP 443 exception to nine Google addresses, both became stable and work on the local network alone. If you have cameras like these at home, block their way out, restart them, and measure what happens.
