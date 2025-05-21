pipeline {
  agent any

  environment {
    DOCKER_IMAGE = 'cyrildoss14/startupapp-3'
    DOCKER_TAG = 'latest'
  }

  stages {

    stage('Build Docker Image') {
      steps {
        dir('Startup-app') {
          sh 'docker-compose build'
        }
      }
    }

    stage('Push to Docker Hub') {
      steps {
        withCredentials([usernamePassword(credentialsId: "${DOCKER_REGISTRY_CREDS}", usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASSWORD')]) {
          sh '''
            echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
            docker push $DOCKER_IMAGE:$DOCKER_TAG
          '''
        }
      }
    }

    stage('Deploy Updated App') {
      steps {
        dir('Startup-app') {
          sh '''
            docker-compose down
            docker-compose pull
            docker-compose up -d
          '''
        }
      }
    }
  }

  
}
