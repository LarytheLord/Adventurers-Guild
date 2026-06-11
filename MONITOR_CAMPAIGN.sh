#!/bin/bash
# Real-time monitoring dashboard for recruitment campaign

echo "🎯 VIT Recruitment Campaign - Live Monitor"
echo "=========================================="
echo ""

while true; do
  clear
  echo "🎯 VIT Recruitment Campaign - Live Monitor"
  echo "=========================================="
  echo ""

  # Check if log file exists
  if [ -f "recruitment-logs.json" ]; then
    TOTAL=$(jq length recruitment-logs.json 2>/dev/null || echo 0)
    SENT=$(jq '[.[] | select(.status == "sent")] | length' recruitment-logs.json 2>/dev/null || echo 0)
    FAILED=$(jq '[.[] | select(.status == "failed")] | length' recruitment-logs.json 2>/dev/null || echo 0)

    echo "📊 Campaign Status:"
    echo "   Total sent: $SENT"
    echo "   Failed: $FAILED"
    echo "   Total processed: $TOTAL / 250"
    echo ""

    if [ $TOTAL -gt 0 ]; then
      SUCCESS_RATE=$((SENT * 100 / TOTAL))
      echo "✅ Success Rate: $SUCCESS_RATE%"
      echo ""

      # Progress bar
      FILLED=$((TOTAL * 50 / 250))
      EMPTY=$((50 - FILLED))
      printf "   Progress: ["
      printf "%-${FILLED}s" | tr ' ' '='
      printf "%-${EMPTY}s" | tr ' ' '-'
      printf "] %d%%\n" $((TOTAL * 100 / 250))
      echo ""
    fi
  else
    echo "⏳ Waiting for logs to be created..."
    echo ""
  fi

  # Show recent activity (last 5 sends)
  if [ -f "recruitment-logs.json" ]; then
    echo "📧 Recent Activity (Last 5):"
    jq '.[-5:] | reverse | .[] | "\(.status == "sent" && "✅" || "❌") \(.email)"' recruitment-logs.json 2>/dev/null | head -5 | sed 's/"//g' | sed 's/^/   /'
    echo ""
  fi

  # Check if done
  if [ -f "recruitment-logs.json" ]; then
    TOTAL=$(jq length recruitment-logs.json 2>/dev/null || echo 0)
    if [ $TOTAL -ge 250 ]; then
      echo "✨ Campaign Complete!"
      echo ""
      break
    fi
  fi

  echo "⏱️  Refreshing in 5 seconds... (Press Ctrl+C to stop)"
  sleep 5
done

echo ""
echo "=========================================="
echo "✅ All emails sent!"
echo ""
echo "📊 Final Statistics:"
SENT=$(jq '[.[] | select(.status == "sent")] | length' recruitment-logs.json 2>/dev/null || echo 0)
FAILED=$(jq '[.[] | select(.status == "failed")] | length' recruitment-logs.json 2>/dev/null || echo 0)
TOTAL=$((SENT + FAILED))

echo "   ✅ Sent: $SENT"
echo "   ❌ Failed: $FAILED"
echo "   📈 Success Rate: $((SENT * 100 / TOTAL))%"
echo ""
echo "📄 Log file: recruitment-logs.json"
echo "🔗 View results: cat recruitment-logs.json | jq ''"
