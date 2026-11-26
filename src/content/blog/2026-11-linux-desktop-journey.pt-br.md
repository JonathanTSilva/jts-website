---
slug: "linux-desktop-journey"
title: "Do Windows ao Omarchy: minha relação com o Linux no desktop"
language: "pt-br"
translationKey: "linux-desktop-journey"
publishedAt: "2026-11-25"
summary: "Como saí do Windows, passei por Ubuntu, Pop!_OS e Arch e cheguei ao Omarchy no meu PC, automatizando o ambiente a cada etapa, e o caminho que funcionou pra mim, pra quem quer fazer a mesma troca."
tags: ["linux", "omarchy", "arch-linux", "dotfiles"]
category: "Linux"
colorToken: "#1793d1"
---

No post sobre o [[2026-11-low-cost-homelab-setup.pt-br|meu homelab de baixo custo]], deixei uma nota dizendo que no PC eu uso o [Omarchy](https://omarchy.org/) e que escreveria depois sobre a minha relação com o Linux e com os sistemas operacionais que já usei. Então aqui está.

O **Omarchy** é a distribuição Linux do [DHH](https://dhh.dk/) baseada no [Arch Linux](https://archlinux.org/) com [Hyprland](https://hypr.land/). Cheguei nele depois de passar por Windows, Ubuntu, Pop!_OS e Arch puro, sempre automatizando o meu próprio ambiente. O Omarchy entrega quase tudo o que eu vinha montando à mão, por isso ficou.

Se você está pensando em trocar de sistema operacional ou montar um desktop Linux pra trabalhar, no fim tem o caminho que funcionou pra mim.

```mermaid
flowchart LR
    win["Windows"] --> ubu["Ubuntu<br/>16.04 a 20.04"]
    ubu --> pop["Pop!_OS"]
    pop --> arch["Arch Linux"]
    arch --> oma["Omarchy<br/>📍 estou aqui"]
    classDef here fill:#1793d1,stroke:#1793d1,color:#ffffff,font-weight:bold
    class oma here
```

## Windows desde cedo

Usei Windows desde pequeno. Meus pais tinham um daqueles computadores antigos, amarelados, como o da imagem abaixo. Com 13 anos comecei a fazer trabalhos com ele: formatava documentos do Office pra amigas da minha mãe. Naquela época pouca gente dominava o computador, e eu digitava bem e aprendia o resto em revistas, fóruns e curiosidade de adolescente.

![[att-20261125154518477.png]]

A coisa ficou mais séria quando comecei a formatar computadores. Eu tinha CDs do Windows 7 e instalava os programas que as pessoas mais pediam, como Nero e Office. Eram crackeados (eu era adolescente e não me orgulho disso), mas resolviam o problema de quem me chamava. Foi nessa época que eu aprendi o Windows de ponta a ponta.

## Ubuntu e dual boot

Entrei no Linux com o [Ubuntu](https://ubuntu.com/) 16.04, num notebook Positivo antigo que tinha em casa (não lembro o modelo). Depois ganhei um Acer Aspire F5 com placa de vídeo dedicada, que era bom o bastante pra rodar meus jogos no Windows.

Nele fiz *dual boot* (dois sistemas no mesmo computador, escolhidos na inicialização com grub) e fui ganhando experiência com Linux por diversão. Passei pelo Ubuntu 18.04 e depois, por pouco tempo, pelo 20.04.

Nessa época comecei a acompanhar o [Diolinux](https://www.youtube.com/@Diolinux), um canal brasileiro que contribui bastante com a comunidade Linux. Por influência dele migrei pro [Pop!_OS](https://system76.com/pop/), da System76. Fiquei bastante tempo nele, com o sistema todo personalizado do meu jeito.

## Um script pra cada instalação nova

Toda vez que eu instalava um Ubuntu ou Pop!_OS do zero, rodava um script em Bash que deixava o sistema do jeito que eu queria. Criei a primeira versão em março de 2021. Era simples: testava a internet, adicionava PPAs, baixava os pacotes `.deb`, instalava o que vinha do apt e do snap e limpava o sistema no final. Você pode acessar o script original neste gist: [UbuntuPostInstall.sh](https://gist.github.com/JonathanTSilva/3cee6ba9506816e370d4777c1bfafc28).

Um trecho, pra dar a ideia:

```bash
# UbuntuSetup.sh - post installations of Ubuntu 20.04.

SOFTWARES_TO_INSTALL_APT=(
    guvcview
    obs-studio
    virtualbox
    anki
)

SOFTWARES_TO_INSTALL_SNAP=(
    spotify
)

install_apt_pkgs () {
    for software in ${SOFTWARES_TO_INSTALL_APT[@]}; do
        if ! dpkg -l | grep -q $software; then
            sudo apt install $software -y &> /dev/null
        fi
    done
}

remove_locks
add_architecture_i386
add_ppas
update_repos
download_and_install_deb_pkgs
install_apt_pkgs
install_snap_pkgs
upgrade_and_clean_system
```

> Tudo que eu fazia mais de duas vezes numa instalação nova virava shell script.

## Dos scripts aos dotfiles

Com o tempo passei a usar mais aplicações *open source* e a automatizar ainda mais a instalação inicial. Além das configurações básicas de interface, cada vez mais apps entravam na minha lista de *dotfiles* (os arquivos de configuração dos programas, que ficam no `$HOME` em arquivos ou pastas que começam com ponto, como `~/.zshrc` e `~/.config`).

Uma versão reduzida da lista:

- editor: [Neovim](https://neovim.io/)
- shell: [Zsh](https://www.zsh.org/), com aliases e funções próprias
- prompt: [Starship](https://starship.rs/), [Oh My Zsh](https://ohmyz.sh/), [Powerlevel10k](https://github.com/romkatv/powerlevel10k)
- terminal e multiplexador: [Ghostty](https://ghostty.org/), [WezTerm](https://wezterm.org/), [tmux](https://github.com/tmux/tmux)
- gerenciadores de janela em *tiling* e personalizações diferentes pra GNOME, Wayland e afins
- lançadores de aplicação e automações
- ferramentas de linha de comando e TUIs: [fzf](https://github.com/junegunn/fzf), [fd](https://github.com/sharkdp/fd), [zoxide](https://github.com/ajeetdsouza/zoxide), [bat](https://github.com/sharkdp/bat), [eza](https://github.com/eza-community/eza), [lazygit](https://github.com/jesseduffield/lazygit), [lazydocker](https://github.com/jesseduffield/lazydocker), [yazi](https://github.com/sxyazi/yazi)
- linters e formatadores
- mais recentemente, configurações de provedores de IA e *skills*

Fora isso, tem as minhas próprias ferramentas CLI e TUI. Algumas são públicas, como o [qemulab](https://github.com/JonathanTSilva/qemulab), o [leetsheet](https://github.com/JonathanTSilva/leetsheet) e o [scriptize](https://github.com/JonathanTSilva/scriptize); a maior parte é privada.

Sim, é muita coisa. Quanto mais você descobre de *open source* (no meu caso, principalmente apps de terminal, que são a minha fixação), mais quer conhecer e personalizar. É a mesma sensação do *ricing* de Linux, a prática de deixar o desktop com a sua cara que enche o [r/unixporn](https://www.reddit.com/r/unixporn/). Pra quem gosta, vicia.

### Forgenv

Foi daí que nasceu o **forgenv**, um gerenciador de dotfiles e de ambiente multiplataforma, com TUI, escrito em Rust. A ideia é preparar os vários ambientes que eu monto em casa, em distribuições Linux diferentes e com propósitos diferentes: desenvolvimento, jogos, entretenimento.

O repositório ainda é privado. Vou escrever sobre ele num post separado.

## I use Arch, BTW

Passei um bom tempo em distribuições baseadas em Debian e Ubuntu, até começar a seguir alguns canais, como o [Typecraft](https://www.youtube.com/@typecraft_dev), e desenvolvedores de que gosto. Aos poucos a frase "I use Arch, BTW" foi entrando na minha cabeça.

Meu ambiente estava estável, automatizado e com a minha cara. Então pensei: por que não passar raiva de novo, gastar mais horas, andar em círculos e quebrar a cara mais algumas vezes? Me animei. Quem gosta sabe do que estou falando: pra mim, isso é compromisso com o aprendizado e amor por ciência e tecnologia.

Migrei pro Arch e montei o ambiente pra ficar do meu gosto e funcional pra mim. O caminho é bem mais árduo que no Ubuntu, mas foi divertido e aprendi muito. Em paralelo, comecei a preparar o forgenv pra funcionar em distribuições baseadas em Arch.

## Omarchy

Em meados de 2025, o DHH começou o Omarchy. Gosto muito dele pelo tanto que já contribuiu com a comunidade, mesmo nunca tendo trabalhado com [Ruby on Rails](https://rubyonrails.org/). O [repositório](https://github.com/omacom/omarchy) foi criado em junho de 2025, e eu abracei a ideia nos primeiros meses, antes do *hype* chegar.

Testei o que estavam entregando naquela época, e a experiência era muito parecida com o que eu projetava pros meus sistemas, inclusive no forgenv. Foram algumas versões em teste até eu decidir migrar o PC principal, por volta de setembro de 2025.

Hoje uso o Omarchy 4.5 e apoio bastante o projeto. Pro meu caso, ele serviu muito bem.

> O Omarchy entrega pronto boa parte do que eu passei anos automatizando à mão.

## Como chegar lá

O caminho que funcionou pra mim foi gradual:

1. Ubuntu ou Pop!_OS em dual boot, sem abrir mão do Windows.
2. Um script que reinstala o seu ambiente, pra perder o medo de formatar.
3. Dotfiles versionados, pra levar a configuração de uma máquina pra outra.
4. Arch, quando o ambiente estiver estável e você quiser entender o que está por baixo.
5. Omarchy, quando quiser o Arch com Hyprland já pronto.

### Instalando o Omarchy

A instalação é pela ISO, gravada num pendrive, segundo o [manual do Omarchy](https://omarchy.org/manual/getting-started/). Antes de começar:

- Na instalação de disco inteiro, o disco escolhido é apagado, e a criptografia vem ligada por padrão. Faça backup.
- Desligue o Secure Boot e/ou o TPM na BIOS.
- Tenha um teclado com fio ou com receptor de 2,4 GHz. Teclado Bluetooth não serve pra digitar a senha da criptografia na inicialização.

Se quiser manter o Windows no mesmo disco, a ISO tem a opção *Free space install*, que instala o Omarchy no espaço livre sem apagar o resto. Antes, diminua o volume do Windows pra liberar espaço e desligue o BitLocker. O passo a passo está na página de [dual boot do manual](https://omarchy.org/manual/dual-boot-install/).

Quando instalei, em 2025, dava pra instalar o Arch com o [archinstall](https://wiki.archlinux.org/title/Archinstall) e rodar um script com `curl`. Esse instalador foi removido em 2026, e hoje o Omarchy só instala pela ISO.

### Mantendo o Windows

Eu mantenho o Windows pra jogar, num disco separado. Depois da instalação, coloquei o Windows no menu do Limine, o *bootloader* do Omarchy, seguindo [um guia da comunidade pra dual boot em dois discos](https://github.com/omacom/omarchy/discussions/1604). Se preferir não fazer à mão, o `limine-entry-tool --scan` lê as entradas UEFI da placa-mãe e deixa você escolher quais adicionar ao Limine.

## Conclusão

Saí do Windows, passei por Ubuntu, Pop!_OS e Arch, e em cada etapa automatizei um pouco mais o meu ambiente. O Omarchy chegou quando eu já sabia o que queria, e entregou isso pronto.

Este post ficou no Linux de desktop. No trabalho, o Linux que eu uso é outro: o de sistemas embarcados, nos dispositivos e no lab de embarcados que montei em casa. Essa parte da minha relação com o Linux fica pra um post separado.

Ainda falta incluir o Omarchy no forgenv. Quando fizer, escrevo sobre isso.
