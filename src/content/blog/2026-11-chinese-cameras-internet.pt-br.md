---
slug: "chinese-cameras-internet"
title: "O que as câmeras chinesas fazem na internet"
language: "pt-br"
translationKey: "chinese-cameras-internet"
publishedAt: "2026-11-20"
summary: "Medi o que duas câmeras Wi-Fi da Jooan tentam acessar na internet, o que acontece quando a rede IoT perde a saída e como elas ficaram funcionando só na rede local, com uma exceção estreita pro Google."
tags: ["home-assistant", "homelab", "iot", "openwrt", "privacidade"]
category: "Homelab"
---

No [[2026-11-low-cost-homelab-setup.pt-br|post sobre o meu homelab]] eu disse que a rede IoT não sai mais pra internet, com uma exceção: as câmeras podem abrir HTTPS pro Google. Prometi explicar essa exceção num post separado, e é o que faço aqui.

Tenho duas câmeras Wi-Fi da **Jooan** em casa, uma W3-U e uma W5-U, usadas pelo app cam720 no celular. A página de login das câmeras aponta pra `policy.qacloud.com.cn`, então a nuvem por trás do app parece ser a "qacloud". Eu desconfiava que elas mandavam imagens pra nuvem do fabricante sem eu pedir.

| ![[att-20261120105307089.png]] | ![[att-20261120104934624.png]] |
|:---: |:---: |
| W5-U | W3-U |

*As duas câmeras Jooan. Cada uma tem duas lentes, uma que gira (PTZ) e uma fixa.*

Medi o que elas tentam acessar e o que acontece quando perdem a internet. Elas funcionam só na rede local, mas não aceitam ficar sem internet nenhuma: a cada minuto e meio derrubam o próprio Wi-Fi até conseguir abrir uma conexão com o Google.

## Como começou

Quando bloqueei totalmente a saída da rede IoT pra internet e tentei parear uma câmera nela pelo cam720, o app falhou com "Device binding failed". O Wi-Fi conectava, a câmera pegava endereço, mas o vínculo com a conta não fechava.

Isso faz sentido: o vínculo registra a câmera na nuvem do fabricante, e sem internet não tem nuvem. Só que, se o pareamento depende da nuvem, o que mais depende dela, e o que sai daqui de casa quando ela está ligada?

Daí veio a vontade de investigar até tirar as dúvidas de privacidade e segurança. Tudo abaixo foi medido no meu roteador [OpenWrt](https://openwrt.org/), com duas câmeras, ao longo de alguns dias. É uma amostra pequena de uma marca só. Não considere como resultado para outras marcas, mas considere o processo que utilizei, e tente rodar em outras câmeras.

## Como medi

Não usei tcpdump nem Wireshark. Tudo o que é tráfego de rede veio do próprio roteador, por SSH, com o que o OpenWrt já traz. Como as câmeras estão no Wi-Fi do roteador, todo pacote delas passa por ele, e isso bastou pra ver pra onde vão e quanto mandam.

As ferramentas foram estas:

- **conntrack**: a tabela de conexões que o kernel Linux mantém pro firewall (o *connection tracking* do netfilter). Cada linha é um fluxo, com origem, destino, portas, estado e contadores de pacotes e bytes nos dois sentidos (o OpenWrt liga essa contagem por padrão). Li direto do arquivo `/proc/net/nf_conntrack`, filtrando pelo endereço da câmera.
- **Log de DNS do dnsmasq**: o dnsmasq é o servidor de DNS e DHCP do OpenWrt. Com a opção `logqueries` ligada, ele grava cada nome que um dispositivo pergunta a ele. Quem fala direto com outro servidor de DNS, ou conecta por endereço fixo, passa por fora desse log.
- **Log do Wi-Fi**: o hostapd, que cuida do access point, grava uma linha `AP-STA-DISCONNECTED` a cada vez que um dispositivo cai. Contei essas linhas por câmera.
- **Regra de firewall com log**: uma regra temporária que descarta e registra o que a câmera tenta mandar pra internet. Mostra tentativas que nunca viram conexão, coisa que o conntrack não mostra.
- **nftables**: depois do primeiro teste, que abriu a internet inteira pra uma câmera, as liberações usaram conjuntos de endereços do nftables (`nft add element`), com uma regra que só deixa a câmera falar com quem está no conjunto.

Os três logs eu li com `logread`, o leitor do log do sistema no OpenWrt. Pro vídeo usei `ffprobe` e `mpv`, e pro ONVIF, `curl` e pequenos scripts Python com as mensagens SOAP montadas na mão. Juntei tudo em scripts bash. Os de teste fazem backup antes, aplicam a mudança e desfazem no fim.

A diferença pro tcpdump é o que fica visível. O conntrack mostra quem falou com quem e quantos bytes passaram, mas não o conteúdo. Pra esta pergunta, isso basta. Pra saber o que vai dentro de uma conexão, seria preciso capturar os pacotes, e mesmo assim, em HTTPS, o conteúdo vem cifrado.

> Pra medir o que um dispositivo IoT faz na rede, o roteador já tem quase tudo: a tabela de conexões, o log de DNS e o log do Wi-Fi.

## O bloqueio que não bloqueou

O primeiro passo foi desligar o encaminhamento da rede IoT pra WAN no firewall do OpenWrt. Conferi o ruleset, puxei o vídeo da câmera pela rede local, e dei o teste por passado.

Porém, estava errado. O conntrack ainda mostrava fluxos vivos da W3-U pra endereços públicos, saindo pela WAN. Um deles, em UDP, tinha cerca de 270 mil pacotes e 60 MB enviados.

O motivo está no começo da cadeia `forward`, numa regra que aceita conexões já estabelecidas (`ct state established,related`). Uma conexão aberta antes da mudança continua passando, e os *keepalives* (pacotes periódicos que mantêm a conexão viva) da câmera renovam ela indefinidamente. A W5-U, que entrou na rede depois do bloqueio, não tinha nenhum fluxo pra fora.

O ruleset e o teste de vídeo local pareciam certos. Só o conntrack mostrou o problema. Desliguei a W3-U da tomada e liguei de novo (na primeira tentativa ela demorou a voltar pra rede e o teste não valeu, então foram duas outras). Depois conferi duas vezes, com dois minutos de intervalo: zero fluxos pra endereços públicos, e o vídeo local funcionando.

> Bloquear tráfego novo não derruba conexão antiga. Depois de mudar o firewall, confira o conntrack ou reinicie o dispositivo.

## Pra onde elas tentam ir

Com a saída bloqueada, liguei o log de consultas DNS do roteador por 6 minutos e reiniciei as duas câmeras. Como não havia internet, o que aparece são só tentativas.

| Nome consultado                                                           | W3-U              | W5-U   | O que parece ser                                                                          |
| ------------------------------------------------------------------------- | ----------------- | ------ | ----------------------------------------------------------------------------------------- |
| `use1mqtt.jooaniot.com`                                                   | 209               | 184    | Canal de mensagens MQTT do fabricante, região leste dos EUA                               |
| `use1api.jooaniot.com`                                                    | 62                | 5      | API da nuvem do fabricante                                                                |
| `us-east-1-jooan-thn.s3.us-east-1.amazonaws.com` e um segundo nome do S3  | 0                 | 27     | Um bucket S3 da Amazon com o nome da Jooan                                                |
| `oss-us-east-1.aliyuncs.com`                                              | 0                 | 3      | Armazenamento da Alibaba Cloud                                                            |
| dois nomes em `iotcplatform.com`, um deles com "tutk"                     | 0                 | 3      | Plataforma P2P da ThroughTek (TUTK), que intermedeia a conexão e, se preciso, retransmite |
| `www.google.com`, `www.facebook.com`, `www.tencent.com`, `www.aliyun.com` | 1 cada (aliyun 2) | 1 cada | Um "tem internet?" da própria câmera                                                      |

A coluna da direita é leitura minha pelos nomes, sem confirmação do fabricante. O nome MQTT (`use1mqtt.jooaniot.com`) foi consultado mais ou menos a cada 3 segundos.

A W3-U não procurou os nomes de armazenamento e de relay nessa janela. A explicação provável é que ela não estava vinculada a armazenamento na nuvem, e a W5-U estava.

Ou seja: do jeito que vêm de fábrica, essas câmeras estão prontas pra mandar dados pra nuvem do fabricante, pra um bucket da Amazon, pra um bucket da Alibaba e pra um serviço de *relay*. Não medi o conteúdo de nada disso, porque o bloqueio impediu as conexões. Mas os destinos existem, e o bloqueio fecha todos eles.

## Sem internet, o Wi-Fi cai a cada minuto e meio

No log do Wi-Fi do roteador, em 81 minutos, a W3-U se desconectou 48 vezes e a W5-U 43 vezes. Todos os outros dispositivos juntos: 7, todas de um celular. Cada queda deixa um buraco de 12 a 15 segundos no vídeo.

O sinal não explica: as câmeras estavam entre -24 e -40 dBm, com ruído em -74 dBm.

Pra testar a hipótese de que a falta de internet causa as quedas, liberei a internet só pra W3-U por cerca de 12 minutos e deixei a W5-U bloqueada como controle. A W3-U parou de cair durante a janela. A W5-U continuou caindo, mais ou menos a cada minuto e meio. Quando tirei a regra e reiniciei a W3-U, ela voltou a cair.

Foi uma câmera só, numa janela de 12 minutos, com outra de controle. A amostra é pequena, mas o efeito foi claro: sem internet, elas reiniciam o Wi-Fi em loop.

## O que a câmera precisa de verdade

A pergunta seguinte foi qual é o mínimo de internet que acaba com o loop. Escrevi um script que libera, por um tempo fixo e só pra uma câmera, um conjunto pequeno de endereços, e mostra as quedas das duas câmeras a cada minuto.

O pacote `dnsmasq` padrão do OpenWrt é compilado sem suporte a nftset (o `dnsmasq-full` tem), então ele não preenche um conjunto de endereços a partir das respostas DNS. O script resolve os nomes no próprio roteador a cada 10 segundos e adiciona os endereços ao conjunto.

### A W3-U: HTTPS pro Google ou pra Aliyun

Os resultados, na ordem em que aconteceram:

1. Só os quatro sites (Google, Facebook, Tencent, Aliyun): as quedas continuaram, e a câmera não abriu conexão com nenhum endereço liberado. Na hora achei que era porque ela só checa no boot. Depois vi que ela repete a checagem sozinha, então essa rodada ficou sem explicação (talvez ela tenha recebido outro endereço da Aliyun).
2. Só o fabricante: as quedas pararam, mas a rodada não valeu. Ao recarregar a configuração, o firewall do OpenWrt não apaga um conjunto de endereços que saiu dela, então os quatro sites da rodada anterior continuavam liberados. Corrigi o script pra apagar o conjunto no início e no fim.
3. Só os quatro sites, conjunto limpo: as quedas pararam depois do quarto minuto. A câmera abriu uma única conexão HTTPS, pra Aliyun.
4. Só `www.aliyun.com`, 20 minutos: parou. Depois que a regra saiu, voltou a cair no mesmo ritmo de antes.
5. Só `www.google.com`, 20 minutos: parou também. Três conexões pro Google na porta 443, nenhuma pra outro lugar.

Conclusão pra W3-U: ela fica estável se conseguir abrir HTTPS pra Google ou pra Aliyun, com o fabricante, os buckets e o relay bloqueados. E ela repete a checagem o tempo todo, então a liberação tem que ser permanente.

Escolhi o Google porque os oito endereços dele ficaram os mesmos durante cerca de 75 minutos de testes, e o da Aliyun mudou no meio de uma rodada.

### A W5-U: cinco DNS públicos, por endereço

Com a mesma regra, a W5-U continuou caindo e não abriu nenhuma conexão pro Google. Reiniciar não mudou nada.

Liguei então um log das tentativas bloqueadas só dela. Em 10 minutos, ela tentou TCP 443 em cinco endereços de servidores DNS públicos, sem consultar nenhum nome antes: `8.8.8.8` (Google), `223.5.5.5` e `223.6.6.6` (AliDNS), `180.76.76.76` (Baidu) e `114.114.114.114` (114DNS). Cerca de 150 tentativas por endereço.

Depois de cerca de 45 minutos em loop após o boot, ela passava sozinha pra checagem do Google e estabilizava. Com `8.8.8.8:443` liberado na hora do boot, ela não entrou no loop. Foi uma rodada de cada jeito, então é um indício forte, ainda sem prova.

### O que vai nessas conexões

A regra permanente ficou assim: as duas câmeras podem abrir TCP 443 pra oito endereços do Google e pra `8.8.8.8`. Um script no roteador atualiza o conjunto a cada minuto, mas só aceita endereços dentro de uma lista de faixas que acredito serem do Google, então uma resposta DNS falsa não alarga a regra. Essa lista foi montada de memória e ainda não conferi.

A pergunta óbvia é se a imagem vai pro Google. Pelos contadores do conntrack, quase todas as conexões das câmeras pro Google tiveram 216 bytes enviados e 112 recebidos. Isso são quatro pacotes pequenos de ida e dois de volta: abrir e fechar uma conexão TCP sem dado nenhum dentro, nem o começo de uma sessão TLS.

Algumas tiveram um pacote de confirmação a mais (164 recebidos, ou 268 enviados). Uma teve 372 enviados e 332 recebidos, e essa eu ainda não expliquei. Os contadores não mostram o conteúdo; uma captura com tcpdump nessa hora mostraria se os bytes a mais eram dados ou pacotes repetidos.

O limite da medição: olhei alguns minutos de tráfego, e a regra deixaria a câmera mandar qualquer coisa praqueles endereços. Mas nada indica que ela faça isso, e os destinos de armazenamento que ela procura são outros, todos bloqueados.

> Pelo que medi, a checagem de internet dessas câmeras abre e fecha uma conexão TCP sem mandar dados. Ela não precisa da nuvem do fabricante pra ficar estável.

## O que funciona só na rede local

Com o loop resolvido, dá pra ver as câmeras sem a nuvem.

- RTSP local: as duas servem vídeo H.264 2304x1296 a 15 fps na porta 554, com login *digest* que eu defini. `live/ch00_0` é a lente que gira (PTZ), `live/ch01_0` é a lente fixa, e a W5-U tem sub-streams de 640x360 em `ch00_1` e `ch01_1`.
- Home Assistant: quatro câmeras genéricas por RTSP num painel. Da rede de serviços, uma única regra de firewall deixa só o Home Assistant iniciar conexão na rede IoT.
- ONVIF, pela metade: a porta 8899 responde e aceita o mesmo login, mas a integração ONVIF do Home Assistant não funciona com essas câmeras. A câmera só entende as mensagens SOAP com certos prefixos de namespace, e a biblioteca que o Home Assistant usa escreve `ns0:`. Em XML o prefixo não deveria importar, então o defeito é da câmera. Testei a mesma chamada com curl: com o prefixo `tds:` responde 200, com `ns0:` responde 400. O movimento da lente (PTZ) ficou funcionando por um script pequeno meu, chamado pelo Home Assistant.
- Posições salvas: não existem. A câmera responde que não suporta `SetPreset` nem posição inicial.

### O relógio volta pra 2021

Sem internet, a câmera perde a hora a cada queda de energia e começa a contar de 11 de novembro de 2021, à meia-noite, com fuso do Pacífico dos EUA.

Tentei resolver com um servidor NTP no roteador. Não funcionou: a câmera não pediu DHCP de novo no boot, e pelo ONVIF ela aceita a troca de servidor NTP com "200 OK" e não muda nada. O servidor gravado é `time.windows.com`, e em 10 minutos ela não mandou nenhum pacote NTP pra lugar nenhum.

O que funciona é ajustar a hora manualmente pelo ONVIF, com o fuso do Brasil. Funciona até a próxima queda de energia, que apaga a hora, o tipo e o fuso. Então o Home Assistant faz isso: a cada 5 minutos ele lê o relógio das câmeras e, se estiver errado, acerta a hora com o fuso do Brasil. Depois de uma queda de energia, a hora errada dura uns 5 minutos.

## E trocar o firmware?

Avaliei trocar o firmware por um aberto, como o [OpenIPC](https://openipc.org/). Resolveria a raiz do problema: sem o firmware do fabricante, não há checagem de internet nem nuvem.

Deixei como último recurso. Exige identificar o chip e aceitar o risco de inutilizar a câmera. Em alguns modelos dá pra instalar pela própria atualização de fábrica, em outros é preciso abrir o aparelho, o que não seria um problema pra mim, mas seria mais trabalhoso. Como o firmware original funciona offline com a exceção do Google, o custo não compensou por enquanto.

## Qual câmera eu compraria hoje

Pra quem quer câmera em casa sem mandar imagem pra nuvem de ninguém, minha ordem seria esta:

1. Câmeras com RTSP e ONVIF documentados, que funcionam sem nuvem, numa rede isolada. É o caminho mais simples se a câmera funcionar offline de verdade. Teste antes de confiar: bloqueie a internet, reinicie, e olhe o **conntrack** e o log do Wi-Fi por uma hora.
2. DVR ou NVR com câmeras cabeadas. Faz sentido quando dá pra passar cabo e o gravador também fica sem internet. A gravação fica num lugar só e funciona sem Wi-Fi. No meu caso de apartamento alugado e antigo, não compensa.
3. Câmeras chinesas "baratas", como as minhas, numa rede IoT sem internet e com uma exceção estreita. Funciona, como mostrei, mas dá trabalho, e cada modelo pode ter uma checagem diferente. A W3-U e a W5-U são da mesma marca e não checam do mesmo jeito.
4. Câmeras com firmware trocado (OpenIPC ou parecido). Pra quem aceita abrir o aparelho e perder a garantia, e quando o modelo tem suporte.

Em qualquer caso, câmera fica numa rede separada, sem acesso às outras redes da casa. Sem internet, as minhas não recebem atualização de firmware, e o servidor web delas é antigo, com login fraco.

## Próximos passos

- Um serviço falso pra checagem. Como a câmera só abre e fecha uma conexão TCP, um servidor local que aceite conexões na porta 443 talvez baste. O plano é apontar um nome da checagem (`www.aliyun.com`) pra ele no DNS local e tirar a exceção do Google, se a câmera aceitar a resposta local. Se funcionar, resolve a W3-U. A W5-U primeiro checa endereços fixos, como `8.8.8.8`, sem DNS, e só depois passa pra checagem por nome, então pra ela ainda falta uma solução.
- Outras marcas. Vou comprar câmeras de outros fabricantes e repetir os mesmos testes, pra ver se esse comportamento é da Jooan ou é comum nas câmeras baratas.
- Gravação no cartão SD, com os clipes de movimento aparecendo no Home Assistant.

## Conclusão

Essas câmeras foram feitas pra viver na nuvem do fabricante, e procuram ela o tempo todo: MQTT, API, buckets na Amazon e na Alibaba, relay. Sem internet nenhuma, elas derrubam o próprio Wi-Fi a cada minuto e meio.

Com a rede IoT bloqueada e uma exceção de TCP 443 pra nove endereços do Google, as duas ficaram estáveis e funcionam só na rede local. Se você tem câmeras assim em casa, bloqueie a saída delas, reinicie, e meça o que acontece.
