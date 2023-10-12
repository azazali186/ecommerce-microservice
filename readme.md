## JAVA 20
## Node 20
### PORT Configuration for Service and DB Server List

| Sr No | Service Name      | PORT  | Sr No | Service Name       | PORT  | Sr No | Service Name       | PORT  |
|------:|-------------------|-------|-------|--------------------|-------|-------|--------------------|-------|
| 1     | API Gateway       | 3099  | 2     | Config             | 3088  | 3     | Eureka             | 3145  |
| 4     | Files             | 3055  | 5     | Elastic Search     | 3200  | 6     | Recom              | 3199  |
| 7     | Postgress         | 3155  | 8     | MongoDB            | 27027 | 9     | Auth Service       | 3110  |
| 10    | Master Service    | 3110  | 11    | Profile service    | 3120  | 12    | catalogue Service  | 3130  |
| 13    | Orders Service    | 3140  | 14    | File service       | 3055  | 15    |                    |       |

### PostgreSQL Server DB List

| Sr No | Database Name         | Sr No | Database Name          | Sr No | Database Name           |
|------:|-----------------------|-------|------------------------|-------|-------------------------|
| 1     | ecom-auth-service     | 2     | ecom-master-service    | 3     | ecom-order-service      |


### MongoDB Server DB List

| Sr No | Database Name         | Sr No | Database Name          | Sr No | Database Name           |
|------:|-----------------------|-------|------------------------|-------|-------------------------|
| 1     | ecom-recom-train      | 2     | ecom-profile-service   | 3     | ecom-file-service       |
| 4     | ecom-catelogue-service| 5     | ecom-order-service     |       |                         |



### create docker images using below command

docker-compose -f docker-compose.build.yml build  --no-cache

### for running the contailers

docker-compose -f docker-compose.up.yml up -d
