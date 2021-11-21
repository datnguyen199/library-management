#!/bin/bash

echo "==========================================Starting replica set initialize================================================"
until mongo --host mongodb1 --eval "print(\"waited for connection\")"
do
  sleep 2
done
echo "Connection finished"
echo "Creating replica set"
mongo --host mongodb1 <<EOF
rs.initiate(
  {
    _id : 'rs0',
    members: [
      { _id : 0, host : "mongodb1:27017" }
    ]
  }
)
EOF
echo "===============================================replica set created========================================================"
