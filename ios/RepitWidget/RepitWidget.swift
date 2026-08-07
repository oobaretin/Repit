import WidgetKit
import SwiftUI

struct PracticeEntry: TimelineEntry {
    let date: Date
    let currentStreak: Int
    let repsThisWeek: Int
    let totalSessions: Int
    let targetReps: Int
    let delay: Double
    let sound: String
}

struct Provider: TimelineProvider {
    private let appGroupId = "group.com.repit.app"

    func placeholder(in context: Context) -> PracticeEntry {
        PracticeEntry(
            date: Date(),
            currentStreak: 3,
            repsThisWeek: 432,
            totalSessions: 12,
            targetReps: 108,
            delay: 1.5,
            sound: "Mala"
        )
    }

    func getSnapshot(in context: Context, completion: @escaping (PracticeEntry) -> Void) {
        completion(loadEntry())
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<PracticeEntry>) -> Void) {
        let entry = loadEntry()
        let nextUpdate = Calendar.current.date(byAdding: .hour, value: 1, to: Date()) ?? Date().addingTimeInterval(3600)
        completion(Timeline(entries: [entry], policy: .after(nextUpdate)))
    }

    private func loadEntry() -> PracticeEntry {
        let defaults = UserDefaults(suiteName: appGroupId)
        return PracticeEntry(
            date: Date(),
            currentStreak: defaults?.integer(forKey: "currentStreak") ?? 0,
            repsThisWeek: defaults?.integer(forKey: "repsThisWeek") ?? 0,
            totalSessions: defaults?.integer(forKey: "totalSessions") ?? 0,
            targetReps: defaults?.integer(forKey: "targetReps") ?? 108,
            delay: defaults?.double(forKey: "delay") ?? 1.5,
            sound: defaults?.string(forKey: "sound") ?? "Mala"
        )
    }
}

struct RepitWidgetEntryView: View {
    var entry: PracticeEntry

    private var practiceLine: String {
        if entry.targetReps <= 0 {
            return "Open count · \(String(format: "%.1f", entry.delay))s"
        }
        return "\(entry.targetReps) reps · \(String(format: "%.1f", entry.delay))s · \(entry.sound)"
    }

    var body: some View {
        ZStack {
            ContainerRelativeShape()
                .fill(
                    LinearGradient(
                        colors: [Color(red: 0.04, green: 0.07, blue: 0.11), Color(red: 0.08, green: 0.12, blue: 0.18)],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )

            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text("Repit")
                        .font(.caption.weight(.semibold))
                        .foregroundColor(Color(red: 0.13, green: 0.83, blue: 0.93))
                    Spacer()
                    if entry.currentStreak > 0 {
                        Text("\(entry.currentStreak)d")
                            .font(.caption2.weight(.bold))
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(Color(red: 0.13, green: 0.83, blue: 0.93).opacity(0.15))
                            .clipShape(Capsule())
                            .foregroundColor(Color(red: 0.13, green: 0.83, blue: 0.93))
                    }
                }

                if entry.totalSessions == 0 {
                    Text("Start your practice")
                        .font(.headline.weight(.semibold))
                        .foregroundColor(.white)
                    Text(practiceLine)
                        .font(.caption)
                        .foregroundColor(.gray)
                        .lineLimit(2)
                } else {
                    Text("\(entry.repsThisWeek) reps")
                        .font(.title2.weight(.semibold))
                        .foregroundColor(.white)
                    Text("this week · \(entry.totalSessions) sessions")
                        .font(.caption)
                        .foregroundColor(.gray)
                    Text(practiceLine)
                        .font(.caption2)
                        .foregroundColor(Color(red: 0.13, green: 0.83, blue: 0.93).opacity(0.85))
                        .lineLimit(2)
                }

                Spacer(minLength: 0)

                Text("Tap to start")
                    .font(.caption2.weight(.semibold))
                    .foregroundColor(.gray)
            }
            .padding(16)
        }
        .widgetURL(URL(string: "repit://practice?start=1"))
    }
}

@main
struct RepitWidget: Widget {
    let kind: String = "RepitWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            RepitWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Practice")
        .description("Your streak, weekly reps, and last practice — tap to start.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
