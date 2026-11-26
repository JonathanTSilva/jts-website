# Changelog

## [1.2.0](https://github.com/JonathanTSilva/jts-website/compare/v1.1.0...v1.2.0) (2026-11-25)


### Features

* add a color for the Linux category ([#180](https://github.com/JonathanTSilva/jts-website/issues/180)) ([ae096b3](https://github.com/JonathanTSilva/jts-website/commit/ae096b3b278dd5d0bf372f8f56ba158c93277218)), closes [#179](https://github.com/JonathanTSilva/jts-website/issues/179)


### Bug Fixes

* **ci:** use [[ ]] tests in install-ci-system-deps.sh ([#167](https://github.com/JonathanTSilva/jts-website/issues/167)) ([f99dbcd](https://github.com/JonathanTSilva/jts-website/commit/f99dbcdde73899ebc4df296f14b683a5c60c8012)), closes [#166](https://github.com/JonathanTSilva/jts-website/issues/166)

## [1.1.0](https://github.com/JonathanTSilva/jts-website/compare/v1.0.0...v1.1.0) (2026-11-23)


### Features

* add an /engineering page fed by the jts-ops dashboard ([#38](https://github.com/JonathanTSilva/jts-website/issues/38)) ([847a2cd](https://github.com/JonathanTSilva/jts-website/commit/847a2cd5d76042c47b11df9ed5558ed05663adc4)), closes [#37](https://github.com/JonathanTSilva/jts-website/issues/37)
* **analytics:** support Plausible pa- tracker script and 404 events ([#148](https://github.com/JonathanTSilva/jts-website/issues/148)) ([049c616](https://github.com/JonathanTSilva/jts-website/commit/049c616fb38c49e6a1839bd5b98afaaa03ef40d5))
* **blog:** gray count badges on inactive category filters ([#71](https://github.com/JonathanTSilva/jts-website/issues/71)) ([c1b2559](https://github.com/JonathanTSilva/jts-website/commit/c1b255960ae368a7422c3e672c30e55b167d677c)), closes [#70](https://github.com/JonathanTSilva/jts-website/issues/70)
* clean slugs shared by both languages, with redirects from every old URL ([#94](https://github.com/JonathanTSilva/jts-website/issues/94)) ([452225b](https://github.com/JonathanTSilva/jts-website/commit/452225b13cca79ea4c5ab510b09fb5b2a499a74c))
* cross-file content validation and scheduled publishing ([#106](https://github.com/JonathanTSilva/jts-website/issues/106)) ([7fecadd](https://github.com/JonathanTSilva/jts-website/commit/7fecadd8d024314ad4da4572211a8f12beb19eec))
* **cv:** add deterministic role profiles ([03f3101](https://github.com/JonathanTSilva/jts-website/commit/03f3101dd18fb23fb11f449042d40e36d094a8a6))
* **cv:** define canonical career contract ([6456402](https://github.com/JonathanTSilva/jts-website/commit/6456402d85577859675c49e138d620acfd36c6f2))
* **cv:** enforce private outputs and quality warnings ([ec8bfff](https://github.com/JonathanTSilva/jts-website/commit/ec8bfffa13aab80677fc246d4d1ea90cbc710513))
* **cv:** generate and verify tagged PDFs ([bb8f226](https://github.com/JonathanTSilva/jts-website/commit/bb8f226fe2dafad1e03e021fc9c35d0a7021ed81))
* **cv:** generate ATS-friendly CVs from website data ([b96545c](https://github.com/JonathanTSilva/jts-website/commit/b96545ceddc4061dba7fde4dd333d81acf93ee44))
* **cv:** generate the public CV during builds ([120aa52](https://github.com/JonathanTSilva/jts-website/commit/120aa52eae538f36b939ec75554823492c997c26))
* **cv:** render semantic single-column resume ([be597ce](https://github.com/JonathanTSilva/jts-website/commit/be597ce514d9d8fa5ae06d0a88cbaea10477c74a))
* **engineering:** hide special repos from /engineering ([#142](https://github.com/JonathanTSilva/jts-website/issues/142)) ([8463e4e](https://github.com/JonathanTSilva/jts-website/commit/8463e4e6fbfa8f1d5b5d22c740060d028deef298))
* **engineering:** rebuild when new dashboard data appears ([#146](https://github.com/JonathanTSilva/jts-website/issues/146)) ([94adde9](https://github.com/JonathanTSilva/jts-website/commit/94adde96689b6359faaf3b8c812302a5cb234f4e))
* **engineering:** show n/a when a badge does not apply ([#159](https://github.com/JonathanTSilva/jts-website/issues/159)) ([32310c7](https://github.com/JonathanTSilva/jts-website/commit/32310c755fba06b0cab069457cfdc2baa296d9ea))
* **engineering:** warn on snapshot fallback and refresh the snapshot weekly ([#144](https://github.com/JonathanTSilva/jts-website/issues/144)) ([f6d7705](https://github.com/JonathanTSilva/jts-website/commit/f6d77055be91657380f1c31a874433d01b593343))
* **header:** add language switcher to the desktop header ([c8fe61b](https://github.com/JonathanTSilva/jts-website/commit/c8fe61b5bbf430b75babd6041bfa1f1d2881bc11)), closes [#68](https://github.com/JonathanTSilva/jts-website/issues/68)
* **header:** add language switcher to the desktop header ([#68](https://github.com/JonathanTSilva/jts-website/issues/68)) ([#69](https://github.com/JonathanTSilva/jts-website/issues/69)) ([c8fe61b](https://github.com/JonathanTSilva/jts-website/commit/c8fe61b5bbf430b75babd6041bfa1f1d2881bc11))
* **og:** readable, branded share cards for LinkedIn ([#59](https://github.com/JonathanTSilva/jts-website/issues/59)) ([#61](https://github.com/JonathanTSilva/jts-website/issues/61)) ([58b7db6](https://github.com/JonathanTSilva/jts-website/commit/58b7db6075b6de68f8ae56d02aa10035a5865ccc))
* **portfolio:** filter skills by category with justified cloud ([40748e6](https://github.com/JonathanTSilva/jts-website/commit/40748e6d42456d56b58fb5a8bd2a332f00033e71))
* **portfolio:** sync experience, skills, and biography with LinkedIn ([be3e4ec](https://github.com/JonathanTSilva/jts-website/commit/be3e4ecba3347e0705d2c516f34ef4438bcb7dfc))
* **portfolio:** sync experience, skills, and biography with LinkedIn ([f01de19](https://github.com/JonathanTSilva/jts-website/commit/f01de19482e15872978051776f8e83cc59a588c9))
* richer article structured data, UTC-stable dates and one site URL ([#105](https://github.com/JonathanTSilva/jts-website/issues/105)) ([444bcae](https://github.com/JonathanTSilva/jts-website/commit/444bcae174b61c26511d082cf8cf1a268bd862c5))


### Bug Fixes

* **a11y:** meet contrast in dark mode and for callouts, badges and code ([#111](https://github.com/JonathanTSilva/jts-website/issues/111)) ([e56c9be](https://github.com/JonathanTSilva/jts-website/commit/e56c9beac3aa298f73f104b15d1b4f9c76e238a5))
* **a11y:** meet contrast in dark mode and for callouts, badges and code ([#40](https://github.com/JonathanTSilva/jts-website/issues/40), [#92](https://github.com/JonathanTSilva/jts-website/issues/92)) ([e56c9be](https://github.com/JonathanTSilva/jts-website/commit/e56c9beac3aa298f73f104b15d1b4f9c76e238a5))
* **a11y:** raise dark --text-muted contrast and run a11y e2e in dark mode ([#41](https://github.com/JonathanTSilva/jts-website/issues/41)) ([ac33908](https://github.com/JonathanTSilva/jts-website/commit/ac33908cc056fa2b7d287f06af2d2b80e2c129b3)), closes [#39](https://github.com/JonathanTSilva/jts-website/issues/39)
* **analytics:** send the page locale from hero contact links ([#162](https://github.com/JonathanTSilva/jts-website/issues/162)) ([43569bb](https://github.com/JonathanTSilva/jts-website/commit/43569bb329dd6a27c84140a0dfa238992cf174c4)), closes [#161](https://github.com/JonathanTSilva/jts-website/issues/161)
* **ci:** close CV deploy and page-size gaps ([fb6f682](https://github.com/JonathanTSilva/jts-website/commit/fb6f6829c9b0d419f324dc1617f3edbc76d633b2))
* **ci:** derive CV gate expectations from career data ([2e9465d](https://github.com/JonathanTSilva/jts-website/commit/2e9465dd23559dc569bd4f7cf280a0033f7bd606))
* **ci:** grant snapshot workflow permission to push commits ([f88bd9f](https://github.com/JonathanTSilva/jts-website/commit/f88bd9f4498d40462dea590030b62474fa0c6959))
* **ci:** harden final CV release gates ([8fc97cf](https://github.com/JonathanTSilva/jts-website/commit/8fc97cf7047e0dc979daadf1a78c4dac432caf91))
* **ci:** pin Playwright jobs to ubuntu-24.04 ([dbfbcbb](https://github.com/JonathanTSilva/jts-website/commit/dbfbcbbf67a37f4ea2e6ab353286e388977014e5))
* **ci:** skip opensource.org in the link check ([#67](https://github.com/JonathanTSilva/jts-website/issues/67)) ([d8977f7](https://github.com/JonathanTSilva/jts-website/commit/d8977f72b76837b8151e731e0cfdb4f35fbf62df))
* close the gaps from the final site review ([#133](https://github.com/JonathanTSilva/jts-website/issues/133)) ([7848255](https://github.com/JonathanTSilva/jts-website/commit/78482550c353f91fb92700ce058ba61c15feb5ee)), closes [#132](https://github.com/JonathanTSilva/jts-website/issues/132)
* **content:** align role positioning with verified facts ([039ee21](https://github.com/JonathanTSilva/jts-website/commit/039ee212b343e0bda96021ed75263fc18e6a740a))
* **content:** preserve approved employer context ([6670a64](https://github.com/JonathanTSilva/jts-website/commit/6670a644a7620c9829cf5669d981818b0c7f87b2))
* **cv:** harden canonical career validation ([14ab6bc](https://github.com/JonathanTSilva/jts-website/commit/14ab6bcb9a5f675e7d84513ac42047ed76b4e5dd))
* **cv:** harden output and quality policies ([45732b8](https://github.com/JonathanTSilva/jts-website/commit/45732b84704018d405d1e69f541f6edafaf68303))
* **cv:** harden PDF verification and privacy ([583f794](https://github.com/JonathanTSilva/jts-website/commit/583f79440c7cb7919d1d77163f9cbd3d161079a5))
* **cv:** make private batch generation transactional ([8cd3770](https://github.com/JonathanTSilva/jts-website/commit/8cd3770bec38ddaf4f9833d2a100b9111719e9d9))
* **cv:** preserve PDF anchor fidelity ([48258b2](https://github.com/JonathanTSilva/jts-website/commit/48258b2d3d9d586a2b37ccbaf135aa3cfbe8f1d9))
* **cv:** recognize measurable career impact ([3bb54c7](https://github.com/JonathanTSilva/jts-website/commit/3bb54c7828021b3770bc0614a5a9c4c6a7af09f3))
* **cv:** reject unsafe batch destinations ([faf398f](https://github.com/JonathanTSilva/jts-website/commit/faf398f84ae85a26657f3765bb345645990b36be))
* **cv:** sort ongoing entries as current ([6dfc06d](https://github.com/JonathanTSilva/jts-website/commit/6dfc06d05064107b66ecc0897e20afe3336ce298))
* **cv:** stop tracking generated public PDF ([9ac396a](https://github.com/JonathanTSilva/jts-website/commit/9ac396a81ea45ec6fe9db698c3a54bbc6b6d1320))
* **cv:** validate renderable URL schemes ([963bb33](https://github.com/JonathanTSilva/jts-website/commit/963bb3330eed17298234d3c78099a0528f2b4827))
* **cv:** validate semantic render structure ([c40cb60](https://github.com/JonathanTSilva/jts-website/commit/c40cb60798e41d368083455b3ee0a49b3141b595))
* **cv:** verify complete PDF output ([c59d480](https://github.com/JonathanTSilva/jts-website/commit/c59d480c3434928b9d6c788bb36e0150c317fb59))
* **deps:** upgrade KaTeX to 0.19.1 (GHSA-238p-pmpm-9mq7) ([#135](https://github.com/JonathanTSilva/jts-website/issues/135)) ([35b2bc1](https://github.com/JonathanTSilva/jts-website/commit/35b2bc104ec4c8a345352fea976b015a3634ef7e)), closes [#134](https://github.com/JonathanTSilva/jts-website/issues/134)
* **mermaid:** readable zebra rows in ER diagrams in the dark theme ([#128](https://github.com/JonathanTSilva/jts-website/issues/128)) ([a427ee1](https://github.com/JonathanTSilva/jts-website/commit/a427ee18a202666a31be694bce716bfa06ee3fa1))
* **mermaid:** readable zebra rows in ER diagrams in the dark theme ([#130](https://github.com/JonathanTSilva/jts-website/issues/130)) ([a427ee1](https://github.com/JonathanTSilva/jts-website/commit/a427ee18a202666a31be694bce716bfa06ee3fa1))
* one URL per page with correct hreflang and sitemap ([#93](https://github.com/JonathanTSilva/jts-website/issues/93)) ([3e76bbc](https://github.com/JonathanTSilva/jts-website/commit/3e76bbc55100540fa75637dc0b6e612569be07f4))
* **portfolio:** drop noisy live region from skills cloud ([bf14dee](https://github.com/JonathanTSilva/jts-website/commit/bf14deed73475a0e15d5f927b35cca0e7c363290))
* **portfolio:** gate provisional career facts ([4421dff](https://github.com/JonathanTSilva/jts-website/commit/4421dff727deeb53bae277efd3209bd68c71dc4e))
* **portfolio:** keep employer progression adjacent ([ba63508](https://github.com/JonathanTSilva/jts-website/commit/ba6350815fb20014b4ff716a183d424f3695211a))
* **portfolio:** match project statuses to GitHub ([#121](https://github.com/JonathanTSilva/jts-website/issues/121)) ([18d043d](https://github.com/JonathanTSilva/jts-website/commit/18d043d74dc19948dc6888519b7346d5d621676d))
* **portfolio:** match project statuses to GitHub ([#122](https://github.com/JonathanTSilva/jts-website/issues/122)) ([18d043d](https://github.com/JonathanTSilva/jts-website/commit/18d043d74dc19948dc6888519b7346d5d621676d))
* **portfolio:** preserve canonical project and publication facts ([a745997](https://github.com/JonathanTSilva/jts-website/commit/a7459976f1dc03e2718a223ad9dcad1db6f906fa))
* **portfolio:** update project links after the repository renames ([#120](https://github.com/JonathanTSilva/jts-website/issues/120)) ([f80d8af](https://github.com/JonathanTSilva/jts-website/commit/f80d8af11e0b9fe7e42c0fdcb48121c832a26cb1))
* **prose:** scroll wide tables instead of widening the page ([#129](https://github.com/JonathanTSilva/jts-website/issues/129)) ([959a638](https://github.com/JonathanTSilva/jts-website/commit/959a638a10f7d3ea7cc66da0e21124d94d2c43ff))
* **prose:** scroll wide tables instead of widening the page ([#131](https://github.com/JonathanTSilva/jts-website/issues/131)) ([959a638](https://github.com/JonathanTSilva/jts-website/commit/959a638a10f7d3ea7cc66da0e21124d94d2c43ff))
* quick wins for performance, privacy and the English Now sync ([#91](https://github.com/JonathanTSilva/jts-website/issues/91)) ([b65a90a](https://github.com/JonathanTSilva/jts-website/commit/b65a90a1f531dac9ad67a9ddf1df3360d5dd35cc))
* resolve 9 open Sonar issues ([#152](https://github.com/JonathanTSilva/jts-website/issues/152)) ([9020944](https://github.com/JonathanTSilva/jts-website/commit/90209441a977eda60fdf1f7fc46084326cf0757e)), closes [#149](https://github.com/JonathanTSilva/jts-website/issues/149)
* **seo:** require explicit canonical person ([601a5bc](https://github.com/JonathanTSilva/jts-website/commit/601a5bc3bfbb10ea1dc3951e99eeb99b978d3ad6))
* **seo:** version og:image URL so social apps refetch the new card ([#62](https://github.com/JonathanTSilva/jts-website/issues/62)) ([#63](https://github.com/JonathanTSilva/jts-website/issues/63)) ([0e8f676](https://github.com/JonathanTSilva/jts-website/commit/0e8f676165c132e8f3ad4ab0ff03bd9811f0b982))
* sync fails on missing images, strips metadata; book covers served from the site ([#107](https://github.com/JonathanTSilva/jts-website/issues/107)) ([058d0c7](https://github.com/JonathanTSilva/jts-website/commit/058d0c7fa4d6bad5da9dda6049040b2d2a1f3407))
