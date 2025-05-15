# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.4.4] - 2025-05-15

### Changed

- Update temporary vehicle title text ([38ca8f6](https://github.com/City-of-Helsinki/parking-permits-ui/commit/38ca8f609ff585bcb7570664fdc12af6b66b81cc))

### Fixed

- Limit temp vehicle max dates to permit maxes ([1ad0caf](https://github.com/City-of-Helsinki/parking-permits-ui/commit/1ad0caf8decfb93c5e31ecef69dfff2f8f99eaa7))

## [1.4.3] - 2025-04-28

### Changed

- Update permit end dialog fi/sv/en-messages ([5609b1b](https://github.com/City-of-Helsinki/parking-permits-ui/commit/5609b1b5d96141f047c2b545e67b2ea6297be37d))
- Update date format ([6322e67](https://github.com/City-of-Helsinki/parking-permits-ui/commit/6322e6788862e0c1154cf89a0818f5d15ff84ba1))

## [1.4.2] - 2024-12-20

### Changed

- Add user parameter to Talpa order creation request ([a1c48a9](https://github.com/City-of-Helsinki/parking-permits-ui/commit/a1c48a92ebcb72af2c6e04f4ca46a6f1110cc669))

## [1.4.1] - 2024-12-19

### Fixed

- Disable month selection until start time is selected ([c3cd509](https://github.com/City-of-Helsinki/parking-permits-ui/commit/c3cd50947d3a411f2b42de0e3379221d8a71aad7))

## [1.4.0] - 2024-12-09

### Added

- Add support for webshop permit preliminary status ([2efc9c4](https://github.com/City-of-Helsinki/parking-permits-ui/commit/2efc9c4303230eefffd8958320593c3839d3688c))

### Changed

- Update HDS to 3.11 ([bda8008](https://github.com/City-of-Helsinki/parking-permits-ui/commit/bda8008c4c63269d38241ae3a96b94783e16a182))
- (apollo-client) ApolloClient as a Login module ([9dbc315](https://github.com/City-of-Helsinki/parking-permits-ui/commit/9dbc31548efaa496670dd9d5db22d37fb8b70265))
- (apollo-client) Add the module to LoginContext ([9ee7b2a](https://github.com/City-of-Helsinki/parking-permits-ui/commit/9ee7b2aec4375d3178fa28fb74963e0a8d42fcb6))
- (apollo-client) Replace usages of the old ApolloClient ([9571e10](https://github.com/City-of-Helsinki/parking-permits-ui/commit/9571e10b76e748d49fdc667a81026a6a05bd7e4c))
- Add missing translations ([725a0df](https://github.com/City-of-Helsinki/parking-permits-ui/commit/725a0dfda510e96d92cf1a7d38b5c33d6de7523a))

## [1.3.0] - 2024-11-25

### Added

- Add missing swedish translations ([ad4ecde](https://github.com/City-of-Helsinki/parking-permits-ui/commit/ad4ecdefced0bd839b9b37b1245975099624239c))

### Changed

- Switch order of radio buttons ([f5d7c5e](https://github.com/City-of-Helsinki/parking-permits-ui/commit/f5d7c5ed319cfaf994fa67ec19c08fd8df6184ed))
- Switch to use Keycloak ([8370d97](https://github.com/City-of-Helsinki/parking-permits-ui/commit/8370d97d9f820d64052b2afe3a1bfcee4150ee2b))

### Fixed

- Fix silent renew so token renewing is handled without issues ([3e937c1](https://github.com/City-of-Helsinki/parking-permits-ui/commit/3e937c15a5a1e7469c0bf3455b642fb7c8fd050b))

## [1.2.0] - 2024-11-14

### Added

- Add customer first name to main titles ([e25ee5c](https://github.com/City-of-Helsinki/parking-permits-ui/commit/e25ee5c2a52941d63cd6292d739f2ee3aa2e8ca3))

### Changed

- Convert to use HDS login component ([853aa10](https://github.com/City-of-Helsinki/parking-permits-ui/commit/853aa10980f72d44c8502e7a2cf429814270a456))
- Update change address functionality ([ab5716f](https://github.com/City-of-Helsinki/parking-permits-ui/commit/ab5716f502cdc519d109ad8aed9725073069bae8))

### Removed

- Remove unused typings ([c31f1b1](https://github.com/City-of-Helsinki/parking-permits-ui/commit/c31f1b1b8be35552f6e4311c9c7038fdb63a9f40))

## [1.1.0] - 2024-08-30

### Added

- Add changelog to project ([e60e16f](https://github.com/City-of-Helsinki/parking-permits-ui/commit/e60e16fd4403ff80a45c1657dd9aee6c4aee2a57))
- Add accessibility report to footer ([7a78c6e](https://github.com/City-of-Helsinki/parking-permits-ui/commit/7a78c6e87af778966f814f4d17e64d996c206210))

### Changed

- Update Azure CI-settings ([15c5fb0](https://github.com/City-of-Helsinki/parking-permits-ui/commit/15c5fb013dc49043b6200e842e5e5bfc6789b44e))
- Update hds-react ([67d8972](https://github.com/City-of-Helsinki/parking-permits-ui/commit/67d897245cdbf0718d394699c1c579d8616b62d4))
- Update react to version 18 ([f5001fd](https://github.com/City-of-Helsinki/parking-permits-ui/commit/f5001fdb6c7ffe8c2e6199737c9662dcfc934b57))
- Update packages ([092cdac](https://github.com/City-of-Helsinki/parking-permits-ui/commit/092cdacf3617da320b7d91b9c9ed2b23c6bff6dd))
- Use AWS ECR Docker image repository ([904104d](https://github.com/City-of-Helsinki/parking-permits-ui/commit/904104d712c1d6f849551521069e1c2a72b022f4))
- Update VAT-texts ([0af17e0](https://github.com/City-of-Helsinki/parking-permits-ui/commit/0af17e01887ed698b6b5a2b4bcca438266e57ccb))

### Fixed

- Hide payment info edit option for fixed permits ([0ccad3e](https://github.com/City-of-Helsinki/parking-permits-ui/commit/0ccad3e07ed14156eb0f1e68ef9a496073ce75dd))
- Show correct product end and start dates when price changes ([dcb8161](https://github.com/City-of-Helsinki/parking-permits-ui/commit/dcb8161466a5dca576c0f3c8b5fead9091958dff))

### Removed

- Remove obsolete Docker Compose version ([8282c6c](https://github.com/City-of-Helsinki/parking-permits-ui/commit/8282c6c3e2a3ae4b57e38b25c7f2dd764c90b05d))

## [1.0.0] - 2024-05-22

* Bootstart react app by @amanpdyadav in https://github.com/City-of-Helsinki/parking-permits-ui/pull/1
* Docker support by @amanpdyadav in https://github.com/City-of-Helsinki/parking-permits-ui/pull/2
* Basic page layout setup with Map by @amanpdyadav in https://github.com/City-of-Helsinki/parking-permits-ui/pull/3
* Oidc client implementation by @amanpdyadav in https://github.com/City-of-Helsinki/parking-permits-ui/pull/4
* Azure pipeline github commit triggers for ui main branch by @AnttiKoistinen431a in https://github.com/City-of-Helsinki/parking-permits-ui/pull/23
* Remove updating or orderId by @amanpdyadav in https://github.com/City-of-Helsinki/parking-permits-ui/pull/73
* Update vehicle interface by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-ui/pull/74
* Talpa status change through notification endpoint on the backend by @amanpdyadav in https://github.com/City-of-Helsinki/parking-permits-ui/pull/72
* Ending valid parking permit by @amanpdyadav in https://github.com/City-of-Helsinki/parking-permits-ui/pull/75
* Sort the permit with primary first by @amanpdyadav in https://github.com/City-of-Helsinki/parking-permits-ui/pull/76
* Move talpa order creation to backend by @amanpdyadav in https://github.com/City-of-Helsinki/parking-permits-ui/pull/77
* Fix text translations by @amanpdyadav in https://github.com/City-of-Helsinki/parking-permits-ui/pull/78
* Multiple price support by @amanpdyadav in https://github.com/City-of-Helsinki/parking-permits-ui/pull/79
* Finnish IBAN numbers validation by @amanpdyadav in https://github.com/City-of-Helsinki/parking-permits-ui/pull/80
* Feature/prevent under age person by @amanpdyadav in https://github.com/City-of-Helsinki/parking-permits-ui/pull/81
* Update components to handle the error by @amanpdyadav in https://github.com/City-of-Helsinki/parking-permits-ui/pull/82
* Update scopes and client_id by @amanpdyadav in https://github.com/City-of-Helsinki/parking-permits-ui/pull/83
* Merge develop to main by @mhieta in https://github.com/City-of-Helsinki/parking-permits-ui/pull/84
* Implement the editing customer address process by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-ui/pull/85
* Change address extra payment case by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-ui/pull/86
* Traficom integration frontend by @amanpdyadav in https://github.com/City-of-Helsinki/parking-permits-ui/pull/88
* Address change fix by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-ui/pull/92
* Feat/Traficom check by @amanpdyadav in https://github.com/City-of-Helsinki/parking-permits-ui/pull/93
* Upgrade packages by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-ui/pull/94
* Merge develop to main by @mhieta in https://github.com/City-of-Helsinki/parking-permits-ui/pull/96
* Fix invalid imports and properties by @amanpdyadav in https://github.com/City-of-Helsinki/parking-permits-ui/pull/97
* Fix failing build by @amanpdyadav in https://github.com/City-of-Helsinki/parking-permits-ui/pull/98
* Use current language as Accept-Langage and Content-Language in request headers by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-ui/pull/100
* Update azure-pipelines-develop.yml by @lorand-ibm in https://github.com/City-of-Helsinki/parking-permits-ui/pull/101
* Update azure-pipelines-release.yml by @amanpdyadav in https://github.com/City-of-Helsinki/parking-permits-ui/pull/104
* Vehicle changed by @amanpdyadav in https://github.com/City-of-Helsinki/parking-permits-ui/pull/103
* Vehicle changed with refund and talpa order by @amanpdyadav in https://github.com/City-of-Helsinki/parking-permits-ui/pull/106
* Fix order id changes by @amanpdyadav in https://github.com/City-of-Helsinki/parking-permits-ui/pull/107
* Feat/vehicle changed by @amanpdyadav in https://github.com/City-of-Helsinki/parking-permits-ui/pull/108
* Fix vehicle change price changes by @amanpdyadav in https://github.com/City-of-Helsinki/parking-permits-ui/pull/109
* Allow customer saving language and load saved language as the default by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-ui/pull/110
* User address changed by @amanpdyadav in https://github.com/City-of-Helsinki/parking-permits-ui/pull/111
* Use talpa orderId to match the correct related permits with order by @amanpdyadav in https://github.com/City-of-Helsinki/parking-permits-ui/pull/112
* Send addressId to resolvers when create/update permits by @mingfeng in https://github.com/City-of-Helsinki/parking-permits-ui/pull/114
* Fix address change issue by @amanpdyadav in https://github.com/City-of-Helsinki/parking-permits-ui/pull/115
* Show proper error on mutation of permit and during the landing page. by @amanpdyadav in https://github.com/City-of-Helsinki/parking-permits-ui/pull/116
* Add functionality for showing receipt URL by @amanpdyadav in https://github.com/City-of-Helsinki/parking-permits-ui/pull/117
* Update href of static links at footer by @amanpdyadav in https://github.com/City-of-Helsinki/parking-permits-ui/pull/119
* Open url to new tab by @amanpdyadav in https://github.com/City-of-Helsinki/parking-permits-ui/pull/120
* Temporary vehicle support by @amanpdyadav in https://github.com/City-of-Helsinki/parking-permits-ui/pull/121
* Email templating for temporary vehicles by @amanpdyadav in https://github.com/City-of-Helsinki/parking-permits-ui/pull/122
* PV-257: Add CookieHub widget (cookie consent) by @danipran in https://github.com/City-of-Helsinki/parking-permits-ui/pull/123
* Revert "PV-257: Add CookieHub widget (cookie consent)" by @amanpdyadav in https://github.com/City-of-Helsinki/parking-permits-ui/pull/124
* User hds cookie consent component by @amanpdyadav in https://github.com/City-of-Helsinki/parking-permits-ui/pull/125
* Add pull request template by @mhieta in https://github.com/City-of-Helsinki/parking-permits-ui/pull/126
* Fix temporary vehicle change issue and handle multiple context with address by @amanpdyadav in https://github.com/City-of-Helsinki/parking-permits-ui/pull/127
* Add Sentry-integration by @mhieta in https://github.com/City-of-Helsinki/parking-permits-ui/pull/128
* Bug fixing related to different scenario address by @amanpdyadav in https://github.com/City-of-Helsinki/parking-permits-ui/pull/135
* Use env template for environment variables by @mhieta in https://github.com/City-of-Helsinki/parking-permits-ui/pull/136
* Bump terser from 4.8.0 to 4.8.1 by @dependabot in https://github.com/City-of-Helsinki/parking-permits-ui/pull/118
* Bump axios from 0.21.1 to 0.21.2 by @dependabot in https://github.com/City-of-Helsinki/parking-permits-ui/pull/137
* Remove package-lock.json since yarn is used by @amanpdyadav in https://github.com/City-of-Helsinki/parking-permits-ui/pull/138
* Bug fixes by @amanpdyadav in https://github.com/City-of-Helsinki/parking-permits-ui/pull/139
* [Snyk] Upgrade axios from 0.21.4 to 0.27.2 by @snyk-bot in https://github.com/City-of-Helsinki/parking-permits-ui/pull/140
* [Snyk] Upgrade eslint-plugin-sonarjs from 0.9.1 to 0.15.0 by @snyk-bot in https://github.com/City-of-Helsinki/parking-permits-ui/pull/141
* UI update for not letting user pay twice for already paid order by @amanpdyadav in https://github.com/City-of-Helsinki/parking-permits-ui/pull/143
* Filter out null and undefined addresses by @mhieta in https://github.com/City-of-Helsinki/parking-permits-ui/pull/146
* Add low-emission consent to change vehicle page by @mhieta in https://github.com/City-of-Helsinki/parking-permits-ui/pull/147
* Add vehicle low-emission consent to vehicle change view by @amanpdyadav in https://github.com/City-of-Helsinki/parking-permits-ui/pull/151
* Fix permit start and end times by @mhieta in https://github.com/City-of-Helsinki/parking-permits-ui/pull/152
* PowerType is not required in the webshop side by @amanpdyadav in https://github.com/City-of-Helsinki/parking-permits-ui/pull/154
* Sort the order of permits with primary first by @amanpdyadav in https://github.com/City-of-Helsinki/parking-permits-ui/pull/155
* Fix the incorrect refund calculations while ending the permit by @amanpdyadav in https://github.com/City-of-Helsinki/parking-permits-ui/pull/156
* Remove unnecessary order confirmation dialog by @mhieta in https://github.com/City-of-Helsinki/parking-permits-ui/pull/157
* Fix ending open ended permit by @amanpdyadav in https://github.com/City-of-Helsinki/parking-permits-ui/pull/158
* Fix/refund for open ended if not started by @amanpdyadav in https://github.com/City-of-Helsinki/parking-permits-ui/pull/159
* Update permit end localizations by @mhieta in https://github.com/City-of-Helsinki/parking-permits-ui/pull/161
* Price change preview for vehicle change with no price difference by @amanpdyadav in https://github.com/City-of-Helsinki/parking-permits-ui/pull/162
* Disable edit buttons if temporary vehicle is active by @amanpdyadav in https://github.com/City-of-Helsinki/parking-permits-ui/pull/163
* Fix Refund button label translations by @mhieta in https://github.com/City-of-Helsinki/parking-permits-ui/pull/164
* Do not allow address change if permit is open ended or not yet started by @amanpdyadav in https://github.com/City-of-Helsinki/parking-permits-ui/pull/165
* Remove unused Navigation bar links by @mhieta in https://github.com/City-of-Helsinki/parking-permits-ui/pull/166
* Do not show refund view if open ended permit started by @amanpdyadav in https://github.com/City-of-Helsinki/parking-permits-ui/pull/167
* Show payment in progress warning message by @amanpdyadav in https://github.com/City-of-Helsinki/parking-permits-ui/pull/168
* Update permit payment in progress messages by @mhieta in https://github.com/City-of-Helsinki/parking-permits-ui/pull/169
* Update all prices to have two decimals by @mhieta in https://github.com/City-of-Helsinki/parking-permits-ui/pull/172
* Prevent permit vehicle change with future start by @mhieta in https://github.com/City-of-Helsinki/parking-permits-ui/pull/171
* Fix: Closing of permit should ask for iban if there is price by @amanpdyadav in https://github.com/City-of-Helsinki/parking-permits-ui/pull/174
* Webshop: Better layouts for special login cases by @amanpdyadav in https://github.com/City-of-Helsinki/parking-permits-ui/pull/175
* PV-519: Add end time for open-ended permits by @danipran in https://github.com/City-of-Helsinki/parking-permits-ui/pull/178
* Fix: Calculate refund months correctly by @danipran in https://github.com/City-of-Helsinki/parking-permits-ui/pull/179
* Fix: Add a check for invalid permit times to fix huge refund sums by @danipran in https://github.com/City-of-Helsinki/parking-permits-ui/pull/180
* Add apartment support for addresses by @mhieta in https://github.com/City-of-Helsinki/parking-permits-ui/pull/185
* Show meaningful error messages by @danjacob-anders in https://github.com/City-of-Helsinki/parking-permits-ui/pull/186
* Webshop: Add checkout-link to frontpage by @danjacob-anders in https://github.com/City-of-Helsinki/parking-permits-ui/pull/187
* Update vehicle emission related translations by @mhieta in https://github.com/City-of-Helsinki/parking-permits-ui/pull/188
* Remove discount calculations from permit forms by @danjacob-anders in https://github.com/City-of-Helsinki/parking-permits-ui/pull/189
* Use permit start and end dates in period prices by @mhieta in https://github.com/City-of-Helsinki/parking-permits-ui/pull/191
* Use permit start and end dates in vehicle details card by @mhieta in https://github.com/City-of-Helsinki/parking-permits-ui/pull/192
* Add times for temp vehicle permit by @danjacob-anders in https://github.com/City-of-Helsinki/parking-permits-ui/pull/193
* Duration selector: refactor translation calls by @danjacob-anders in https://github.com/City-of-Helsinki/parking-permits-ui/pull/194
* Payment success page: only show receipt link if available by @danjacob-anders in https://github.com/City-of-Helsinki/parking-permits-ui/pull/195
* Skip dialog when deleting permit by @danjacob-anders in https://github.com/City-of-Helsinki/parking-permits-ui/pull/197
* Use session storage as OIDC-storage by @mhieta in https://github.com/City-of-Helsinki/parking-permits-ui/pull/199
* Add Traficom copyright-markings to Webshop vehicle fields by @mhieta in https://github.com/City-of-Helsinki/parking-permits-ui/pull/198
* Hide add secondary vehicle button for open ended permit by @mhieta in https://github.com/City-of-Helsinki/parking-permits-ui/pull/201
* Pv 678 use permit dates by @danjacob-anders in https://github.com/City-of-Helsinki/parking-permits-ui/pull/202
* Pv 689 change vehicle summary fixes by @danjacob-anders in https://github.com/City-of-Helsinki/parking-permits-ui/pull/203
* Calculate unit price per vehicle based on product unit price and low by @danjacob-anders in https://github.com/City-of-Helsinki/parking-permits-ui/pull/204
* Show positive values in IBAN refund form by @danjacob-anders in https://github.com/City-of-Helsinki/parking-permits-ui/pull/205
* Calculate discount price in changing vehicles based on new discount and by @danjacob-anders in https://github.com/City-of-Helsinki/parking-permits-ui/pull/206
* Fix routing to show price preview for open ended permits by @danjacob-anders in https://github.com/City-of-Helsinki/parking-permits-ui/pull/207
* Add check for editing vehicle or address of permit by @danjacob-anders in https://github.com/City-of-Helsinki/parking-permits-ui/pull/208
* Show traficom restrictions by @danjacob-anders in https://github.com/City-of-Helsinki/parking-permits-ui/pull/210
* Add canBeRefunded check when issuing refunds on change vehicle or ending by @danjacob-anders in https://github.com/City-of-Helsinki/parking-permits-ui/pull/211
* Check refund amount when ending permit or changing vehicle by @danjacob-anders in https://github.com/City-of-Helsinki/parking-permits-ui/pull/212
* Updated translations and messaging for Traficom restrictions etc by @danjacob-anders in https://github.com/City-of-Helsinki/parking-permits-ui/pull/213
* Add updated Swedish and English translations by @danjacob-anders in https://github.com/City-of-Helsinki/parking-permits-ui/pull/214
* Updated low emission link by @danjacob-anders in https://github.com/City-of-Helsinki/parking-permits-ui/pull/217
* Remove copyright messages from vehicle error notifications by @danjacob-anders in https://github.com/City-of-Helsinki/parking-permits-ui/pull/219
* Add VAT and net price calculations by @danjacob-anders in https://github.com/City-of-Helsinki/parking-permits-ui/pull/222
* Add extra state to handle two sets of radio buttons by @danjacob-anders in https://github.com/City-of-Helsinki/parking-permits-ui/pull/223
* Only show Traficom copyright notice if the vehicle has been updated from by @danjacob-anders in https://github.com/City-of-Helsinki/parking-permits-ui/pull/224
* Pv 779 extend fixed permits by @danjacob-anders in https://github.com/City-of-Helsinki/parking-permits-ui/pull/226
* Handles new maxExtensionMonthCount permit setting by @danjacob-anders in https://github.com/City-of-Helsinki/parking-permits-ui/pull/227
* Set minimum start/end dates for temp vehicles to current date/time. by @danjacob-anders in https://github.com/City-of-Helsinki/parking-permits-ui/pull/228
* Add credit card update link to permit page by @danjacob-anders in https://github.com/City-of-Helsinki/parking-permits-ui/pull/229
* Add credit card update link to permit page by @danjacob-anders in https://github.com/City-of-Helsinki/parking-permits-ui/pull/230
* Add registration help text by @danjacob-anders in https://github.com/City-of-Helsinki/parking-permits-ui/pull/231
* Handle refund calculation taking into account end of period by @danjacob-anders in https://github.com/City-of-Helsinki/parking-permits-ui/pull/232
* Change search vehicle button finnish translation by @tonipel in https://github.com/City-of-Helsinki/parking-permits-ui/pull/233
* Change address has changed -notification texts by @tonipel in https://github.com/City-of-Helsinki/parking-permits-ui/pull/234
* Add text when purchasing permits by @tonipel in https://github.com/City-of-Helsinki/parking-permits-ui/pull/235

## New Contributors
* @lorand-ibm made their first contribution in https://github.com/City-of-Helsinki/parking-permits-ui/pull/101
* @danipran made their first contribution in https://github.com/City-of-Helsinki/parking-permits-ui/pull/123
* @dependabot made their first contribution in https://github.com/City-of-Helsinki/parking-permits-ui/pull/118
* @snyk-bot made their first contribution in https://github.com/City-of-Helsinki/parking-permits-ui/pull/140
* @danjacob-anders made their first contribution in https://github.com/City-of-Helsinki/parking-permits-ui/pull/186

**Full Changelog**: https://github.com/City-of-Helsinki/parking-permits-ui/commits/release-1.0.0