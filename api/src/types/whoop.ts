enum WhoopWebhookType {
  RECOVERY_UPDATED = "recovery.updated",
  RECOVERY_DELTED = "recovery.deleted",
  WORKOUT_UPDATED = "workout.updated",
  WORKOUT_DELETED = "workout.deleted",
  SLEEP_UPDATED = "sleep.updated",
  SLEEP_DELETED = "sleep.deleted",
}

interface WhoopWebhookData {
  user_id: number;
  id: number;
  type: string;
  trace_id: string;
}

interface WhoopScoreData {
  strain: number;
  average_heart_rate: number;
  max_heart_rate: number;
  kilojoule: number;
  percent_recorded: number;
  distance_meter: number;
  altitude_gain_meter: number;
  altitude_change_meter: number;
  zone_duration: {
    zone_zero_milli: number;
    zone_one_milli: number;
    zone_two_milli: number;
    zone_three_milli: number;
    zone_four_milli: number;
    zone_five_milli: number;
  };
}
interface WhoopWorkoutData {
  id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  start: string;
  end: string;
  timezone_offset: string;
  sport_id: number;
  score_state: string;
  score: WhoopScoreData;
}

const WhoopWorkoutMap = new Map<string, string>([
  ["-1", "Activity"],
  ["0", "Running"],
  ["1", "Cycling"],
  ["16", "Baseball"],
  ["17", "Basketball"],
  ["18", "Rowing"],
  ["19", "Fencing"],
  ["20", "Field Hockey"],
  ["21", "Football"],
  ["22", "Golf"],
  ["24", "Ice Hockey"],
  ["25", "Lacrosse"],
  ["27", "Rugby"],
  ["28", "Sailing"],
  ["29", "Skiing"],
  ["30", "Soccer"],
  ["31", "Softball"],
  ["32", "Squash"],
  ["33", "Swimming"],
  ["34", "Tennis"],
  ["35", "Track &amp; Field"],
  ["36", "Volleyball"],
  ["37", "Water Polo"],
  ["38", "Wrestling"],
  ["39", "Boxing"],
  ["42", "Dance"],
  ["43", "Pilates"],
  ["44", "Yoga"],
  ["45", "Weightlifting"],
  ["47", "Cross Country Skiing"],
  ["48", "Functional Fitness"],
  ["49", "Duathlon"],
  ["51", "Gymnastics"],
  ["52", "Hiking/Rucking"],
  ["53", "Horseback Riding"],
  ["55", "Kayaking"],
  ["56", "Martial Arts"],
  ["57", "Mountain Biking"],
  ["59", "Powerlifting"],
  ["60", "Rock Climbing"],
  ["61", "Paddleboarding"],
  ["62", "Triathlon"],
  ["63", "Walking"],
  ["64", "Surfing"],
  ["65", "Elliptical"],
  ["66", "Stairmaster"],
  ["70", "Meditation"],
  ["71", "Other"],
  ["73", "Diving"],
  ["74", "Operations - Tactical"],
  ["75", "Operations - Medical"],
  ["76", "Operations - Flying"],
  ["77", "Operations - Water"],
  ["82", "Ultimate"],
  ["83", "Climber"],
  ["84", "Jumping Rope"],
  ["85", "Australian Football"],
  ["86", "Skateboarding"],
  ["87", "Coaching"],
  ["88", "Ice Bath"],
  ["89", "Commuting"],
  ["90", "Gaming"],
  ["91", "Snowboarding"],
  ["92", "Motocross"],
  ["93", "Caddying"],
  ["94", "Obstacle Course Racing"],
  ["95", "Motor Racing"],
  ["96", "HIIT"],
  ["97", "Spin"],
  ["98", "Jiu Jitsu"],
  ["99", "Manual Labor"],
  ["100", "Cricket"],
  ["101", "Pickleball"],
  ["102", "Inline Skating"],
  ["103", "Box Fitness"],
  ["104", "Spikeball"],
  ["105", "Wheelchair Pushing"],
  ["106", "Paddle Tennis"],
  ["107", "Barre"],
  ["108", "Stage Performance"],
  ["109", "High Stress Work"],
  ["110", "Parkour"],
  ["111", "Gaelic Football"],
  ["112", "Hurling/Camogie"],
  ["113", "Circus Arts"],
  ["121", "Massage Therapy"],
  ["125", "Watching Sports"],
  ["126", "Assault Bike"],
  ["127", "Kickboxing"],
  ["128", "Stretching"],
  ["230", "Table Tennis"],
  ["231", "Badminton"],
  ["232", "Netball"],
  ["233", "Sauna"],
  ["234", "Disc Golf"],
  ["235", "Yard Work"],
  ["236", "Air Compression"],
  ["237", "Percussive Massage"],
  ["238", "Paintball"],
  ["239", "Ice Skating"],
  ["240", "Handball"],
]);
export {
  WhoopWebhookType,
  WhoopWebhookData,
  WhoopWorkoutData,
  WhoopWorkoutMap,
};
