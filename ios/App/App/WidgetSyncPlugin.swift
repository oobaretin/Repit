import Foundation
import Capacitor
import WidgetKit

@objc(WidgetSyncPlugin)
public class WidgetSyncPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "WidgetSyncPlugin"
    public let jsName = "WidgetSync"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "sync", returnType: CAPPluginReturnPromise),
    ]

    private let appGroupId = "group.com.repit.app"

    @objc func sync(_ call: CAPPluginCall) {
        guard let defaults = UserDefaults(suiteName: appGroupId) else {
            call.reject("App Group not configured. See docs/ios-widget-setup.md")
            return
        }

        defaults.set(call.getInt("currentStreak") ?? 0, forKey: "currentStreak")
        defaults.set(call.getInt("repsThisWeek") ?? 0, forKey: "repsThisWeek")
        defaults.set(call.getInt("totalSessions") ?? 0, forKey: "totalSessions")

        if #available(iOS 14.0, *) {
            WidgetCenter.shared.reloadAllTimelines()
        }

        call.resolve()
    }
}
