# tasktracker-logicapps

## Introduction

> This tool downloads emails asynchronously from Office 365 using logic apps, and then allows you to quickly reply, archive, or create a task for reach email. This happens in-line, without context switching. Current desktop and web applications are too slow - this is very minimal

## Background

> I made this tool in May 2018 outside of work hours, during a time where I had a significant amount of emails. The organisation has moved to Microsoft Teams now in a major way, but this still comes in handy.

## Installation

> You need a logic app for responding to emails, and a logic app for downloading emails.

Open config.example.js.

Change `url_actions` and `ùrl_emails` to the urls for your logic apps. Change `email_sig` to your email signature.

Rename config.example.js to config.js.

```
const url_actions = "";
// const for sending actions
const url_emails = "";
// const for getting emails
const email_sig = `<p>Your signature</p>`;
```
