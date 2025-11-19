# PowerShell script to add preventDefault to all games
$games = @(
    'qbert', 'bomberman', 'sokoban', 'pac-man',
    'bubble-shooter', 'checkers-game', 'chess-game', 'connect-four',
    'crossword', 'duck-hunt', 'fruit-ninja', 'hangman', 'mahjong',
    'memory-card-game', 'missile-command', 'ping-pong-ai', 'quiz-game',
    'rock-paper-scissors', 'simon-game', 'sliding-puzzle', 'sudoku',
    'tic-tac-toe', 'typing-speed-test', 'whack-a-mole', 'wordle',
    'blackjack', 'yahtzee', 'defender', 'contra', 'centipede'
)

foreach ($game in $games) {
    $filePath = "D:\Code\sourcegames\$game\script.js"
    if (Test-Path $filePath) {
        $content = Get-Content $filePath -Raw

        # Add preventDefault snippet if not already present
        if ($content -notmatch 'e\.preventDefault\(\)') {
            Write-Host "Adding preventDefault to $game..."

            # Add at the beginning of the file
            $preventCode = @"
// Prevent page scroll from game controls
document.addEventListener('keydown', function(e) {
    if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','w','W','a','A','s','S','d','D','q','Q','e','E'].includes(e.key)) {
        e.preventDefault();
    }
}, false);

"@
            Set-Content $filePath -Value ($preventCode + $content)
        }
    }
}

Write-Host "Done! All games updated."

