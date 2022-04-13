# Pexip Breakout Rooms Plugin

For documentation on the plugin, please refer to our docs here https://developer.pex.me/plugins/breakout-rooms

## Define the local policy

This plugin needs additional configuration in the Pexip Infinity Management Node. The following configuration will create the breakout rooms on the fly.
       
```jinja
{
  {% set groups = pex_regex_search("^(breakout-room-\d-.*)$", call_info.local_alias ) %}
  {% if service_config %}
    "action" : "continue",
    {% if service_config.service_type == "conference" %}
      "result" : {{ service_config | pex_to_json }}
    {% endif %}
  {% else %}
    {% if groups %}
      "action" : "continue",
      "result" : {
        "name" : "{{ groups[0] }}",
        "service_tag": "breakout-room",
        "service_type" : "conference"
      }
    {% endif %}
  {% endif %}
}