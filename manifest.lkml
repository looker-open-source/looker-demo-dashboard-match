application: dashboard_match {
  label: "Dashboard Match"
  file: "bundle.js"
  # url: "https://localhost:8080/bundle.js"
  entitlements: {
    core_api_methods: ["all_dashboards","folder_dashboards", "dashboard", "update_dashboard", "dashboard_dashboard_elements"]
    navigation: yes
    use_embeds: yes
    use_iframes: yes
    new_window: yes
    new_window_external_urls: ["https://developers.generativeai.google/*"]
    local_storage: yes
    external_api_urls: ["https://generativelanguage.googleapis.com"]
  }
}
