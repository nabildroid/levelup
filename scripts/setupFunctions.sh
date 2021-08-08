#!/usr/bin/env bash


function fncEndpoint(){
    url=$(gcloud functions describe $1 | grep -e 'url: https:.*')
    url=(${url// / })
    url=${url[1]}
    echo $url
}


function regex1 { gawk 'match($0,/'$1'/, ary) {print ary['${2:-'1'}']}'; }


function fnc(){
    pwd
    config=$(cat "./scripts/config.functions.json" | jq ".$1")

    if [[ "$config" != "null" ]]; then
        state=$(echo "$config" | jq ".state" | xargs)
        # make the function private
        if [[ $state == "private" ]]; then
            echo "$1" | xargs -I {} gcloud functions remove-iam-policy-binding {} --member=allUsers --role=roles/cloudfunctions.invoker
        fi

        topic=$(echo "$config" | jq ".topic")
        topic=$(echo $topic | xargs printf)
        if [[ "$topic" != "null" ]]; then
            exists=$(echo "$topic" | xargs -I {} sh -c "gcloud pubsub topics list | grep {}" )

            # create topic
            if [[ -z "$exists" ]]; then
                printf $topic | xargs -I {} gcloud pubsub topics create {}
            fi

            # create subscription
            filter=$(echo "$config" | jq ".filter")
            if [[  $filter != "null" ]]; then
                filter=$(echo "--message-filter='$filter'")
            fi

            if [[  $filter == "null" ]]; then
                filter=""
            fi
            subscription_id="$1_$topic"
            
            endpoint=$(fncEndpoint $1)

            subExists=$(echo $subscription_id | xargs -I {} gcloud pubsub subscriptions describe {} 2>/dev/null)

            if [[ -n $subExists ]]; then 
            
                # todo update pubsub
                # echo $filter | xargs -I {} echo "gcloud pubsub subscriptions update $subscription_id ---push-endpoint=$endpoint {}"
                echo $subscription_id | xargs -I {} gcloud pubsub subscriptions delete {}
            fi

            echo $filter | xargs -I {} -t sh -c "gcloud pubsub subscriptions create $subscription_id --topic=$topic --push-endpoint=$endpoint --labels=type=deployment {}"

        fi
    fi
}


gcloud config set project levelup-automation

a="$(gcloud functions list)";

echo "$a" | while read line; do
    arrIN=(${line// / })
    name=${arrIN[0]}
    if [[ "$name" != "NAME" ]]; then
        fnc "$name"
    fi
done


