import os
import json

games_to_create = [
    {
        "folder": "mario-bros",
        "title": "Mario Bros",
        "icon": "🍄",
        "description": "Classic platformer! Jump on enemies and collect coins!",
        "controls": {
            "Move": "Arrow Keys / WASD",
            "Jump": "Space / W / Up Arrow",
            "Pause": "P"
        },
        "objective": "Jump on enemies, collect coins, avoid obstacles, and reach the flag!",
        "color": "#e74c3c",
        "secondaryColor": "#c0392b"
    },
    {
        "folder": "bubble-bobble",
        "title": "Bubble Bobble",
        "icon": "🐲",
        "description": "Trap enemies in bubbles! Classic arcade platformer!",
        "controls": {
            "Move": "Arrow Keys / WASD",
            "Shoot Bubble": "Space",
            "Jump": "W / Up Arrow",
            "Pause": "P"
        },
        "objective": "Trap all enemies in bubbles and pop them to clear the level!",
        "color": "#3498db",
        "secondaryColor": "#2980b9"
    },
    {
        "folder": "metal-slug",
        "title": "Metal Slug",
        "icon": "🎖️",
        "description": "Run and gun action! Shoot everything that moves!",
        "controls": {
            "Move": "Arrow Keys / WASD",
            "Shoot": "Space",
            "Jump": "W / Up Arrow",
            "Grenade": "Shift",
            "Pause": "P"
        },
        "objective": "Fight through enemy soldiers, destroy tanks, and rescue hostages!",
        "color": "#27ae60",
        "secondaryColor": "#229954"
    },
    {
        "folder": "raiden",
        "title": "Raiden",
        "icon": "✈️",
        "description": "Vertical scrolling shooter! Epic aerial combat!",
        "controls": {
            "Move": "Arrow Keys / WASD",
            "Shoot": "Space",
            "Bomb": "Shift",
            "Pause": "P"
        },
        "objective": "Destroy enemy planes, tanks, and bosses! Collect power-ups!",
        "color": "#9b59b6",
        "secondaryColor": "#8e44ad"
    },
    {
        "folder": "battlecity",
        "title": "Battle City",
        "icon": "🚜",
        "description": "Tank warfare! Defend your base from enemy tanks!",
        "controls": {
            "Move": "Arrow Keys / WASD",
            "Shoot": "Space",
            "Pause": "P"
        },
        "objective": "Destroy all enemy tanks while protecting your base!",
        "color": "#f39c12",
        "secondaryColor": "#e67e22"
    },
    {
        "folder": "street-fighter",
        "title": "Street Fighter",
        "icon": "🥊",
        "description": "Classic fighting game! Battle AI opponent!",
        "controls": {
            "Move": "Arrow Keys / A/D",
            "Punch": "Space",
            "Kick": "Shift",
            "Special": "S + Space",
            "Pause": "P"
        },
        "objective": "Defeat your opponent with punches, kicks, and special moves!",
        "color": "#e74c3c",
        "secondaryColor": "#c0392b"
    },
    {
        "folder": "double-dragon",
        "title": "Double Dragon",
        "icon": "👊",
        "description": "Beat 'em up classic! Fight through waves of enemies!",
        "controls": {
            "Move": "Arrow Keys / WASD",
            "Punch": "Space",
            "Kick": "Shift",
            "Pause": "P"
        },
        "objective": "Fight through thugs and bosses to rescue your girlfriend!",
        "color": "#34495e",
        "secondaryColor": "#2c3e50"
    },
    {
        "folder": "outrun",
        "title": "OutRun",
        "icon": "🏎️",
        "description": "Classic racing! Drive through scenic routes!",
        "controls": {
            "Steer": "Arrow Keys / A/D",
            "Accelerate": "Up Arrow / W",
            "Brake": "Down Arrow / S",
            "Pause": "P"
        },
        "objective": "Race through checkpoints before time runs out!",
        "color": "#e91e63",
        "secondaryColor": "#c2185b"
    },
    {
        "folder": "excitebike",
        "title": "Excitebike",
        "icon": "🏍️",
        "description": "Motocross racing! Jump ramps and avoid obstacles!",
        "controls": {
            "Accelerate": "Up Arrow / W",
            "Turbo": "Space (overheats!)",
            "Move": "Left/Right Arrows / A/D",
            "Pause": "P"
        },
        "objective": "Complete the track in the fastest time!",
        "color": "#ff5722",
        "secondaryColor": "#f4511e"
    },
    {
        "folder": "shinobi",
        "title": "Shinobi",
        "icon": "🥷",
        "description": "Ninja action! Throw shurikens and use ninja magic!",
        "controls": {
            "Move": "Arrow Keys / WASD",
            "Jump": "W / Up Arrow",
            "Shuriken": "Space",
            "Magic": "Shift",
            "Pause": "P"
        },
        "objective": "Defeat enemies and rescue hostages with ninja skills!",
        "color": "#607d8b",
        "secondaryColor": "#546e7a"
    }
]

base_path = r"D:\\Code\\sourcegames"

# CSS template
css_template = """* {{
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}}

body {{
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: linear-gradient(135deg, {color} 0%, {secondary_color} 100%);
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    padding: 20px;
}}

.game-container {{
    background: rgba(255, 255, 255, 0.95);
    border-radius: 20px;
    padding: 30px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    max-width: 900px;
    width: 100%;
}}

.header {{
    text-align: center;
    margin-bottom: 20px;
}}

h1 {{
    color: {color};
    font-size: 2.5em;
    margin-bottom: 15px;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}}

.info {{
    display: flex;
    justify-content: center;
    gap: 30px;
    flex-wrap: wrap;
    margin-bottom: 15px;
}}

.info-item {{
    font-size: 1.2em;
}}

.label {{
    font-weight: bold;
    color: #555;
    margin-right: 8px;
}}

#gameCanvas {{
    display: block;
    margin: 0 auto;
    border: 3px solid {color};
    border-radius: 10px;
    background: #1a1a1a;
    max-width: 100%;
}}

.controls {{
    display: flex;
    justify-content: center;
    gap: 15px;
    margin-top: 20px;
}}

.btn {{
    padding: 12px 30px;
    font-size: 1.1em;
    font-weight: bold;
    color: white;
    background: linear-gradient(135deg, {color} 0%, {secondary_color} 100%);
    border: none;
    border-radius: 25px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}}

.btn:hover:not(:disabled) {{
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}}

.btn:disabled {{
    opacity: 0.5;
    cursor: not-allowed;
}}

.instructions {{
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    padding: 25px;
    border-radius: 15px;
    margin-bottom: 20px;
    border: 2px solid {color};
}}

.instructions h2 {{
    color: {color};
    margin-bottom: 15px;
}}

.instructions p {{
    margin: 10px 0;
    font-size: 1em;
    color: #333;
}}

.instructions strong {{
    color: {color};
}}

.game-over {{
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 40px;
    border-radius: 20px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    text-align: center;
    min-width: 300px;
}}

.game-over h2 {{
    color: {color};
    font-size: 2.5em;
    margin-bottom: 20px;
}}

.game-over p {{
    font-size: 1.3em;
    margin: 10px 0;
    color: #555;
}}

.hidden {{
    display: none;
}}

@media (max-width: 768px) {{
    h1 {{
        font-size: 2em;
    }}

    .info {{
        gap: 15px;
    }}

    .info-item {{
        font-size: 1em;
    }}
}}
"""

# Generate files for each game
for game in games_to_create:
    folder_path = os.path.join(base_path, game["folder"])

    # Create style.css
    css_content = css_template.format(
        color=game["color"],
        secondary_color=game["secondaryColor"]
    )

    with open(os.path.join(folder_path, "style.css"), "w", encoding="utf-8") as f:
        f.write(css_content)

    print(f"Created style.css for {game['title']}")

print("\\nAll CSS files created successfully!")

