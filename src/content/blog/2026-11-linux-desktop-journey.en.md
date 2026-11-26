---
slug: "linux-desktop-journey"
title: "From Windows to Omarchy: my history with Linux on the desktop"
language: "en"
translationKey: "linux-desktop-journey"
publishedAt: "2026-11-25"
summary: "How I went from Windows through Ubuntu, Pop!_OS and Arch to Omarchy on my PC, automating my environment at each step, and the path that worked for me if you want to make the same switch."
tags: ["linux", "omarchy", "arch-linux", "dotfiles"]
category: "Linux"
colorToken: "#1793d1"
---

In the post about [[2026-11-low-cost-homelab-setup.en|my low-cost homelab]], I left a note saying that I use [Omarchy](https://omarchy.org/) on my PC and that I would write later about my history with Linux and the operating systems I have used. So here it is.

**Omarchy** is [DHH](https://dhh.dk/)'s Linux distribution, based on [Arch Linux](https://archlinux.org/) with [Hyprland](https://hypr.land/). I got there after going through Windows, Ubuntu, Pop!_OS and plain Arch, automating my own environment the whole way. Omarchy delivers almost everything I had been building by hand, so it stayed.

If you're thinking about switching operating systems or setting up a Linux desktop for work, the path that worked for me is at the end.

```mermaid
flowchart LR
    win["Windows"] --> ubu["Ubuntu<br/>16.04 to 20.04"]
    ubu --> pop["Pop!_OS"]
    pop --> arch["Arch Linux"]
    arch --> oma["Omarchy<br/>📍 I'm here"]
    classDef here fill:#1793d1,stroke:#1793d1,color:#ffffff,font-weight:bold
    class oma here
```

## Windows from an early age

I used Windows from when I was a kid. My parents had one of those old, yellowed computers, like the one in the image below. At 13 I started doing small jobs on it: I formatted Office documents for my mother's friends. Back then few people knew their way around a computer, and I typed well and learned the rest from magazines, forums and teenage curiosity.

![[att-20261125154518477.png]]

Things got more serious when I started reinstalling Windows on people's computers. I had Windows 7 CDs and installed the programs people asked for most, like Nero and Office. They were cracked (I was a teenager and I'm not proud of it), but they solved the problem for whoever called me. That was when I learned Windows inside and out.

## Ubuntu and dual boot

I got into Linux with [Ubuntu](https://ubuntu.com/) 16.04, on an old Positivo laptop we had at home (I don't remember the model). Later I got an Acer Aspire F5 with a dedicated graphics card, good enough to run my games on Windows.

On it I set up *dual boot* (two systems on the same computer, picked at startup with GRUB) and kept gaining Linux experience for fun. I went through Ubuntu 18.04 and then, briefly, 20.04.

Around that time I started following [Diolinux](https://www.youtube.com/@Diolinux), a Brazilian channel that contributes a lot to the Linux community. Under its influence I moved to [Pop!_OS](https://system76.com/pop/), from System76. I stayed on it for a long time, with the whole system customized my way.

## A script for every fresh install

Every time I installed Ubuntu or Pop!_OS from scratch, I ran a Bash script that set the system up the way I wanted. I wrote the first version in March 2021. It was simple: it tested the internet connection, added PPAs, downloaded the `.deb` packages, installed what came from apt and snap, and cleaned up the system at the end. You can see the original script in this gist: [UbuntuPostInstall.sh](https://gist.github.com/JonathanTSilva/3cee6ba9506816e370d4777c1bfafc28).

An excerpt, to give you the idea:

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

> Anything I did more than twice on a fresh install became a shell script.

## From scripts to dotfiles

Over time I started using more *open source* applications and automating the initial setup even further. Beyond the basic interface settings, more and more apps went into my list of *dotfiles* (the programs' configuration files, which live in `$HOME` in files or folders whose names start with a dot, like `~/.zshrc` and `~/.config`).

A reduced version of the list:

- editor: [Neovim](https://neovim.io/)
- shell: [Zsh](https://www.zsh.org/), with my own aliases and functions
- prompt: [Starship](https://starship.rs/), [Oh My Zsh](https://ohmyz.sh/), [Powerlevel10k](https://github.com/romkatv/powerlevel10k)
- terminal and multiplexer: [Ghostty](https://ghostty.org/), [WezTerm](https://wezterm.org/), [tmux](https://github.com/tmux/tmux)
- *tiling* window managers and different customizations for GNOME, Wayland and the like
- application launchers and automations
- command line tools and TUIs: [fzf](https://github.com/junegunn/fzf), [fd](https://github.com/sharkdp/fd), [zoxide](https://github.com/ajeetdsouza/zoxide), [bat](https://github.com/sharkdp/bat), [eza](https://github.com/eza-community/eza), [lazygit](https://github.com/jesseduffield/lazygit), [lazydocker](https://github.com/jesseduffield/lazydocker), [yazi](https://github.com/sxyazi/yazi)
- linters and formatters
- more recently, AI provider configs and *skills*

On top of that, there are my own CLI and TUI tools. Some are public, like [qemulab](https://github.com/JonathanTSilva/qemulab), [leetsheet](https://github.com/JonathanTSilva/leetsheet) and [scriptize](https://github.com/JonathanTSilva/scriptize); most are private.

Yes, it's a lot. The more *open source* you discover (in my case, mostly terminal apps, which are my obsession), the more you want to try and customize. It's the same feeling as Linux *ricing*, the practice of making the desktop your own that fills [r/unixporn](https://www.reddit.com/r/unixporn/). If you enjoy it, it's addictive.

### Forgenv

That's where **forgenv** came from: a cross-platform dotfiles and environment manager, with a TUI, written in Rust. The idea is to set up the different environments I build at home, on different Linux distributions and for different purposes: development, gaming, entertainment.

The repository is still private. I'll write about it in a separate post.

## I use Arch, BTW

I spent a good while on Debian and Ubuntu based distributions, until I started following a few channels, like [Typecraft](https://www.youtube.com/@typecraft_dev), and developers I like. Little by little the phrase "I use Arch, BTW" got into my head.

My environment was stable, automated and the way I liked it. So I thought: why not get frustrated again, spend more hours, go around in circles and fall flat on my face a few more times? I got excited. If you enjoy this, you know what I mean: for me, it's a commitment to learning and a love of science and technology.

I moved to Arch and set up the environment to suit my taste and work for me. The road is much harder than on Ubuntu, but it was fun and I learned a lot. In parallel, I started preparing forgenv to work on Arch based distributions.

## Omarchy

In mid-2025, DHH started Omarchy. I like him a lot for how much he has given back to the community, even though I've never worked with [Ruby on Rails](https://rubyonrails.org/). The [repository](https://github.com/omacom/omarchy) was created in June 2025, and I embraced the idea in the first months, before the *hype* arrived.

I tested what they were shipping at the time, and the experience was very close to what I had been designing for my own systems, forgenv included. After a few versions in testing, I decided to move my main PC over, around September 2025.

Today I use Omarchy 4.5 and support the project a lot. For my case, it has worked very well.

> Omarchy ships, ready to use, much of what I spent years automating by hand.

## How to get there

The path that worked for me was gradual:

1. Ubuntu or Pop!_OS in dual boot, without giving up Windows.
2. A script that reinstalls your environment, so you lose the fear of wiping the machine.
3. Versioned dotfiles, to carry your configuration from one machine to another.
4. Arch, once your environment is stable and you want to understand what's underneath.
5. Omarchy, when you want Arch with Hyprland ready to go.

### Installing Omarchy

You install it from the ISO, written to a USB stick, according to the [Omarchy manual](https://omarchy.org/manual/getting-started/). Before you start:

- With a full-disk install, the chosen disk is wiped, and encryption is on by default. Back up first.
- Turn off Secure Boot and/or TPM in the BIOS.
- Have a wired keyboard or one with a 2.4 GHz receiver. A Bluetooth keyboard can't type the encryption password at startup.

If you want to keep Windows on the same disk, the ISO has a *Free space install* option, which installs Omarchy in the free space without wiping the rest. Before that, shrink the Windows volume to free up space and turn off BitLocker. The step by step is on the manual's [dual boot page](https://omarchy.org/manual/dual-boot-install/).

When I installed it, in 2025, you could install Arch with [archinstall](https://wiki.archlinux.org/title/Archinstall) and run a script with `curl`. That installer was removed in 2026, and today Omarchy only installs from the ISO.

### Keeping Windows

I keep Windows for gaming, on a separate disk. After the install, I added Windows to the menu of Limine, Omarchy's *bootloader*, following [a community guide for dual boot on two disks](https://github.com/omacom/omarchy/discussions/1604). If you'd rather not do it by hand, `limine-entry-tool --scan` reads the UEFI entries from the motherboard and lets you choose which ones to add to Limine.

## Conclusion

I left Windows, went through Ubuntu, Pop!_OS and Arch, and at each step I automated my environment a bit more. Omarchy arrived when I already knew what I wanted, and it shipped exactly that, ready to use.

This post stayed on desktop Linux. At work, the Linux I use is a different one: embedded systems, in devices and in the embedded lab I set up at home. That part of my history with Linux goes in a separate post.

Omarchy still needs to be added to forgenv. When I do it, I'll write about it.
