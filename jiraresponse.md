Request URL
http://localhost:3001/api/integrations/jira/proxy
Request Method
POST
Status Code
200 OK
Remote Address
[::1]:3001
Referrer Policy
strict-origin-when-cross-origin

request payload:
{method: "POST", path: "/rest/api/3/search/jql",…}
data
: 
{jql: "updated >= -90d ORDER BY updated DESC", maxResults: 50,…}
fields
: 
["summary", "status", "assignee", "priority", "updated"]
0
: 
"summary"
1
: 
"status"
2
: 
"assignee"
3
: 
"priority"
4
: 
"updated"
jql
: 
"updated >= -90d ORDER BY updated DESC"
maxResults
: 
50
method
: 
"POST"
path
: 
"/rest/api/3/search/jql"


response:
{
    "issues": [
        {
            "expand": "renderedFields,names,schema,operations,editmeta,changelog,versionedRepresentations",
            "id": "10065",
            "self": "https://capstone5.atlassian.net/rest/api/3/issue/10065",
            "key": "KAN-25",
            "fields": {
                "summary": "LK-4 PROGRESS",
                "assignee": null,
                "priority": {
                    "self": "https://capstone5.atlassian.net/rest/api/3/priority/3",
                    "iconUrl": "https://capstone5.atlassian.net/images/icons/priorities/medium_new.svg",
                    "name": "Medium",
                    "id": "3"
                },
                "updated": "2026-04-26T21:07:32.972+0700",
                "status": {
                    "self": "https://capstone5.atlassian.net/rest/api/3/status/10005",
                    "description": "",
                    "iconUrl": "https://capstone5.atlassian.net/images/icons/statuses/generic.png",
                    "name": "Idea",
                    "id": "10005",
                    "statusCategory": {
                        "self": "https://capstone5.atlassian.net/rest/api/3/statuscategory/2",
                        "id": 2,
                        "key": "new",
                        "colorName": "blue-gray",
                        "name": "To Do"
                    }
                }
            }
        },
        {
            "expand": "renderedFields,names,schema,operations,editmeta,changelog,versionedRepresentations",
            "id": "10064",
            "self": "https://capstone5.atlassian.net/rest/api/3/issue/10064",
            "key": "KAN-24",
            "fields": {
                "summary": "WEBSITE BUILDER",
                "assignee": null,
                "priority": {
                    "self": "https://capstone5.atlassian.net/rest/api/3/priority/3",
                    "iconUrl": "https://capstone5.atlassian.net/images/icons/priorities/medium_new.svg",
                    "name": "Medium",
                    "id": "3"
                },
                "updated": "2026-04-26T20:28:09.566+0700",
                "status": {
                    "self": "https://capstone5.atlassian.net/rest/api/3/status/10006",
                    "description": "",
                    "iconUrl": "https://capstone5.atlassian.net/images/icons/statuses/generic.png",
                    "name": "To Do",
                    "id": "10006",
                    "statusCategory": {
                        "self": "https://capstone5.atlassian.net/rest/api/3/statuscategory/4",
                        "id": 4,
                        "key": "indeterminate",
                        "colorName": "yellow",
                        "name": "In Progress"
                    }
                }
            }
        },
        {
            "expand": "renderedFields,names,schema,operations,editmeta,changelog,versionedRepresentations",
            "id": "10031",
            "self": "https://capstone5.atlassian.net/rest/api/3/issue/10031",
            "key": "KAN-23",
            "fields": {
                "summary": "LK-3 PROGRESS",
                "assignee": null,
                "priority": {
                    "self": "https://capstone5.atlassian.net/rest/api/3/priority/3",
                    "iconUrl": "https://capstone5.atlassian.net/images/icons/priorities/medium_new.svg",
                    "name": "Medium",
                    "id": "3"
                },
                "updated": "2026-04-26T20:28:07.862+0700",
                "status": {
                    "self": "https://capstone5.atlassian.net/rest/api/3/status/10006",
                    "description": "",
                    "iconUrl": "https://capstone5.atlassian.net/images/icons/statuses/generic.png",
                    "name": "To Do",
                    "id": "10006",
                    "statusCategory": {
                        "self": "https://capstone5.atlassian.net/rest/api/3/statuscategory/4",
                        "id": 4,
                        "key": "indeterminate",
                        "colorName": "yellow",
                        "name": "In Progress"
                    }
                }
            }
        },
        {
            "expand": "renderedFields,names,schema,operations,editmeta,changelog,versionedRepresentations",
            "id": "10020",
            "self": "https://capstone5.atlassian.net/rest/api/3/issue/10020",
            "key": "KAN-12",
            "fields": {
                "summary": "LK-2 PROGRESS",
                "assignee": null,
                "priority": {
                    "self": "https://capstone5.atlassian.net/rest/api/3/priority/3",
                    "iconUrl": "https://capstone5.atlassian.net/images/icons/priorities/medium_new.svg",
                    "name": "Medium",
                    "id": "3"
                },
                "updated": "2026-04-07T07:57:22.816+0700",
                "status": {
                    "self": "https://capstone5.atlassian.net/rest/api/3/status/10009",
                    "description": "",
                    "iconUrl": "https://capstone5.atlassian.net/images/icons/statuses/generic.png",
                    "name": "Done",
                    "id": "10009",
                    "statusCategory": {
                        "self": "https://capstone5.atlassian.net/rest/api/3/statuscategory/3",
                        "id": 3,
                        "key": "done",
                        "colorName": "green",
                        "name": "Done"
                    }
                }
            }
        },
        {
            "expand": "renderedFields,names,schema,operations,editmeta,changelog,versionedRepresentations",
            "id": "10025",
            "self": "https://capstone5.atlassian.net/rest/api/3/issue/10025",
            "key": "KAN-17",
            "fields": {
                "summary": "Bab 4 (Design System) -LK2",
                "assignee": {
                    "self": "https://capstone5.atlassian.net/rest/api/3/user?accountId=712020%3A2bfa05de-ef86-40d9-a3f3-a2b8f1d433f5",
                    "accountId": "712020:2bfa05de-ef86-40d9-a3f3-a2b8f1d433f5",
                    "avatarUrls": {
                        "48x48": "https://secure.gravatar.com/avatar/0eebc21d40a9cd12fca7a35b24f409dd?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FAN-4.png",
                        "24x24": "https://secure.gravatar.com/avatar/0eebc21d40a9cd12fca7a35b24f409dd?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FAN-4.png",
                        "16x16": "https://secure.gravatar.com/avatar/0eebc21d40a9cd12fca7a35b24f409dd?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FAN-4.png",
                        "32x32": "https://secure.gravatar.com/avatar/0eebc21d40a9cd12fca7a35b24f409dd?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FAN-4.png"
                    },
                    "displayName": "Afifah Nabila",
                    "active": true,
                    "timeZone": "Asia/Jakarta",
                    "accountType": "atlassian"
                },
                "priority": {
                    "self": "https://capstone5.atlassian.net/rest/api/3/priority/3",
                    "iconUrl": "https://capstone5.atlassian.net/images/icons/priorities/medium_new.svg",
                    "name": "Medium",
                    "id": "3"
                },
                "updated": "2026-04-07T07:57:20.846+0700",
                "status": {
                    "self": "https://capstone5.atlassian.net/rest/api/3/status/10009",
                    "description": "",
                    "iconUrl": "https://capstone5.atlassian.net/images/icons/statuses/generic.png",
                    "name": "Done",
                    "id": "10009",
                    "statusCategory": {
                        "self": "https://capstone5.atlassian.net/rest/api/3/statuscategory/3",
                        "id": 3,
                        "key": "done",
                        "colorName": "green",
                        "name": "Done"
                    }
                }
            }
        },
        {
            "expand": "renderedFields,names,schema,operations,editmeta,changelog,versionedRepresentations",
            "id": "10026",
            "self": "https://capstone5.atlassian.net/rest/api/3/issue/10026",
            "key": "KAN-18",
            "fields": {
                "summary": "Bab 4 (Diagram System) -LK2",
                "assignee": {
                    "self": "https://capstone5.atlassian.net/rest/api/3/user?accountId=712020%3Afa6f8cd3-3508-42bf-b760-c6e1adcac37b",
                    "accountId": "712020:fa6f8cd3-3508-42bf-b760-c6e1adcac37b",
                    "avatarUrls": {
                        "48x48": "https://secure.gravatar.com/avatar/7c86aa6908fcb4912075f35c829e68a2?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FAN-0.png",
                        "24x24": "https://secure.gravatar.com/avatar/7c86aa6908fcb4912075f35c829e68a2?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FAN-0.png",
                        "16x16": "https://secure.gravatar.com/avatar/7c86aa6908fcb4912075f35c829e68a2?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FAN-0.png",
                        "32x32": "https://secure.gravatar.com/avatar/7c86aa6908fcb4912075f35c829e68a2?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FAN-0.png"
                    },
                    "displayName": "Aufii Fathin Nabila",
                    "active": true,
                    "timeZone": "Asia/Jakarta",
                    "accountType": "atlassian"
                },
                "priority": {
                    "self": "https://capstone5.atlassian.net/rest/api/3/priority/3",
                    "iconUrl": "https://capstone5.atlassian.net/images/icons/priorities/medium_new.svg",
                    "name": "Medium",
                    "id": "3"
                },
                "updated": "2026-04-07T07:57:15.326+0700",
                "status": {
                    "self": "https://capstone5.atlassian.net/rest/api/3/status/10009",
                    "description": "",
                    "iconUrl": "https://capstone5.atlassian.net/images/icons/statuses/generic.png",
                    "name": "Done",
                    "id": "10009",
                    "statusCategory": {
                        "self": "https://capstone5.atlassian.net/rest/api/3/statuscategory/3",
                        "id": 3,
                        "key": "done",
                        "colorName": "green",
                        "name": "Done"
                    }
                }
            }
        },
        {
            "expand": "renderedFields,names,schema,operations,editmeta,changelog,versionedRepresentations",
            "id": "10028",
            "self": "https://capstone5.atlassian.net/rest/api/3/issue/10028",
            "key": "KAN-20",
            "fields": {
                "summary": "Bab 6 - LK2",
                "assignee": {
                    "self": "https://capstone5.atlassian.net/rest/api/3/user?accountId=712020%3Ad0d5a6ed-6d8e-4cda-b7ec-bfa79c328d83",
                    "accountId": "712020:d0d5a6ed-6d8e-4cda-b7ec-bfa79c328d83",
                    "avatarUrls": {
                        "48x48": "https://secure.gravatar.com/avatar/32715ff33da61ad771f166caa6fc4009?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FA-5.png",
                        "24x24": "https://secure.gravatar.com/avatar/32715ff33da61ad771f166caa6fc4009?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FA-5.png",
                        "16x16": "https://secure.gravatar.com/avatar/32715ff33da61ad771f166caa6fc4009?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FA-5.png",
                        "32x32": "https://secure.gravatar.com/avatar/32715ff33da61ad771f166caa6fc4009?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FA-5.png"
                    },
                    "displayName": "AL",
                    "active": true,
                    "timeZone": "Asia/Jakarta",
                    "accountType": "atlassian"
                },
                "priority": {
                    "self": "https://capstone5.atlassian.net/rest/api/3/priority/3",
                    "iconUrl": "https://capstone5.atlassian.net/images/icons/priorities/medium_new.svg",
                    "name": "Medium",
                    "id": "3"
                },
                "updated": "2026-04-07T07:57:13.720+0700",
                "status": {
                    "self": "https://capstone5.atlassian.net/rest/api/3/status/10009",
                    "description": "",
                    "iconUrl": "https://capstone5.atlassian.net/images/icons/statuses/generic.png",
                    "name": "Done",
                    "id": "10009",
                    "statusCategory": {
                        "self": "https://capstone5.atlassian.net/rest/api/3/statuscategory/3",
                        "id": 3,
                        "key": "done",
                        "colorName": "green",
                        "name": "Done"
                    }
                }
            }
        },
        {
            "expand": "renderedFields,names,schema,operations,editmeta,changelog,versionedRepresentations",
            "id": "10027",
            "self": "https://capstone5.atlassian.net/rest/api/3/issue/10027",
            "key": "KAN-19",
            "fields": {
                "summary": "Bab 5 - LK2",
                "assignee": {
                    "self": "https://capstone5.atlassian.net/rest/api/3/user?accountId=712020%3Ac4c66b82-841b-4f9a-b239-b0548010e7b5",
                    "accountId": "712020:c4c66b82-841b-4f9a-b239-b0548010e7b5",
                    "avatarUrls": {
                        "48x48": "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/712020:c4c66b82-841b-4f9a-b239-b0548010e7b5/a16ffd91-9073-4e57-811f-11e694349764/48",
                        "24x24": "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/712020:c4c66b82-841b-4f9a-b239-b0548010e7b5/a16ffd91-9073-4e57-811f-11e694349764/24",
                        "16x16": "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/712020:c4c66b82-841b-4f9a-b239-b0548010e7b5/a16ffd91-9073-4e57-811f-11e694349764/16",
                        "32x32": "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/712020:c4c66b82-841b-4f9a-b239-b0548010e7b5/a16ffd91-9073-4e57-811f-11e694349764/32"
                    },
                    "displayName": "Dwi Cahya Maulani",
                    "active": true,
                    "timeZone": "Asia/Jakarta",
                    "accountType": "atlassian"
                },
                "priority": {
                    "self": "https://capstone5.atlassian.net/rest/api/3/priority/3",
                    "iconUrl": "https://capstone5.atlassian.net/images/icons/priorities/medium_new.svg",
                    "name": "Medium",
                    "id": "3"
                },
                "updated": "2026-03-31T13:49:45.990+0700",
                "status": {
                    "self": "https://capstone5.atlassian.net/rest/api/3/status/10009",
                    "description": "",
                    "iconUrl": "https://capstone5.atlassian.net/images/icons/statuses/generic.png",
                    "name": "Done",
                    "id": "10009",
                    "statusCategory": {
                        "self": "https://capstone5.atlassian.net/rest/api/3/statuscategory/3",
                        "id": 3,
                        "key": "done",
                        "colorName": "green",
                        "name": "Done"
                    }
                }
            }
        },
        {
            "expand": "renderedFields,names,schema,operations,editmeta,changelog,versionedRepresentations",
            "id": "10024",
            "self": "https://capstone5.atlassian.net/rest/api/3/issue/10024",
            "key": "KAN-16",
            "fields": {
                "summary": "Bab 3 - LK2",
                "assignee": {
                    "self": "https://capstone5.atlassian.net/rest/api/3/user?accountId=712020%3A8c296311-3f85-4cc3-aa35-1423075bfe09",
                    "accountId": "712020:8c296311-3f85-4cc3-aa35-1423075bfe09",
                    "avatarUrls": {
                        "48x48": "https://secure.gravatar.com/avatar/4cb278e31b2bfb8ddc3b852dcca17ab0?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FB-3.png",
                        "24x24": "https://secure.gravatar.com/avatar/4cb278e31b2bfb8ddc3b852dcca17ab0?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FB-3.png",
                        "16x16": "https://secure.gravatar.com/avatar/4cb278e31b2bfb8ddc3b852dcca17ab0?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FB-3.png",
                        "32x32": "https://secure.gravatar.com/avatar/4cb278e31b2bfb8ddc3b852dcca17ab0?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FB-3.png"
                    },
                    "displayName": "bagas190405",
                    "active": true,
                    "timeZone": "Asia/Jakarta",
                    "accountType": "atlassian"
                },
                "priority": {
                    "self": "https://capstone5.atlassian.net/rest/api/3/priority/3",
                    "iconUrl": "https://capstone5.atlassian.net/images/icons/priorities/medium_new.svg",
                    "name": "Medium",
                    "id": "3"
                },
                "updated": "2026-03-31T13:49:44.229+0700",
                "status": {
                    "self": "https://capstone5.atlassian.net/rest/api/3/status/10009",
                    "description": "",
                    "iconUrl": "https://capstone5.atlassian.net/images/icons/statuses/generic.png",
                    "name": "Done",
                    "id": "10009",
                    "statusCategory": {
                        "self": "https://capstone5.atlassian.net/rest/api/3/statuscategory/3",
                        "id": 3,
                        "key": "done",
                        "colorName": "green",
                        "name": "Done"
                    }
                }
            }
        },
        {
            "expand": "renderedFields,names,schema,operations,editmeta,changelog,versionedRepresentations",
            "id": "10022",
            "self": "https://capstone5.atlassian.net/rest/api/3/issue/10022",
            "key": "KAN-14",
            "fields": {
                "summary": "Bab 1 - LK2",
                "assignee": {
                    "self": "https://capstone5.atlassian.net/rest/api/3/user?accountId=712020%3Ad0d5a6ed-6d8e-4cda-b7ec-bfa79c328d83",
                    "accountId": "712020:d0d5a6ed-6d8e-4cda-b7ec-bfa79c328d83",
                    "avatarUrls": {
                        "48x48": "https://secure.gravatar.com/avatar/32715ff33da61ad771f166caa6fc4009?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FA-5.png",
                        "24x24": "https://secure.gravatar.com/avatar/32715ff33da61ad771f166caa6fc4009?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FA-5.png",
                        "16x16": "https://secure.gravatar.com/avatar/32715ff33da61ad771f166caa6fc4009?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FA-5.png",
                        "32x32": "https://secure.gravatar.com/avatar/32715ff33da61ad771f166caa6fc4009?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FA-5.png"
                    },
                    "displayName": "AL",
                    "active": true,
                    "timeZone": "Asia/Jakarta",
                    "accountType": "atlassian"
                },
                "priority": {
                    "self": "https://capstone5.atlassian.net/rest/api/3/priority/3",
                    "iconUrl": "https://capstone5.atlassian.net/images/icons/priorities/medium_new.svg",
                    "name": "Medium",
                    "id": "3"
                },
                "updated": "2026-03-30T10:53:39.515+0700",
                "status": {
                    "self": "https://capstone5.atlassian.net/rest/api/3/status/10009",
                    "description": "",
                    "iconUrl": "https://capstone5.atlassian.net/images/icons/statuses/generic.png",
                    "name": "Done",
                    "id": "10009",
                    "statusCategory": {
                        "self": "https://capstone5.atlassian.net/rest/api/3/statuscategory/3",
                        "id": 3,
                        "key": "done",
                        "colorName": "green",
                        "name": "Done"
                    }
                }
            }
        },
        {
            "expand": "renderedFields,names,schema,operations,editmeta,changelog,versionedRepresentations",
            "id": "10023",
            "self": "https://capstone5.atlassian.net/rest/api/3/issue/10023",
            "key": "KAN-15",
            "fields": {
                "summary": "Bab 2 - LK2",
                "assignee": {
                    "self": "https://capstone5.atlassian.net/rest/api/3/user?accountId=712020%3A215015b3-23ab-4ab4-9566-446b8e1f1ee1",
                    "accountId": "712020:215015b3-23ab-4ab4-9566-446b8e1f1ee1",
                    "avatarUrls": {
                        "48x48": "https://secure.gravatar.com/avatar/57f37f9522c11b364789a6ddb5aee05e?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FID-3.png",
                        "24x24": "https://secure.gravatar.com/avatar/57f37f9522c11b364789a6ddb5aee05e?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FID-3.png",
                        "16x16": "https://secure.gravatar.com/avatar/57f37f9522c11b364789a6ddb5aee05e?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FID-3.png",
                        "32x32": "https://secure.gravatar.com/avatar/57f37f9522c11b364789a6ddb5aee05e?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FID-3.png"
                    },
                    "displayName": "Irza Dzulhika",
                    "active": true,
                    "timeZone": "Asia/Jakarta",
                    "accountType": "atlassian"
                },
                "priority": {
                    "self": "https://capstone5.atlassian.net/rest/api/3/priority/3",
                    "iconUrl": "https://capstone5.atlassian.net/images/icons/priorities/medium_new.svg",
                    "name": "Medium",
                    "id": "3"
                },
                "updated": "2026-03-16T16:15:20.368+0700",
                "status": {
                    "self": "https://capstone5.atlassian.net/rest/api/3/status/10009",
                    "description": "",
                    "iconUrl": "https://capstone5.atlassian.net/images/icons/statuses/generic.png",
                    "name": "Done",
                    "id": "10009",
                    "statusCategory": {
                        "self": "https://capstone5.atlassian.net/rest/api/3/statuscategory/3",
                        "id": 3,
                        "key": "done",
                        "colorName": "green",
                        "name": "Done"
                    }
                }
            }
        }
    ],
    "isLast": true
}