from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Contact
from .serializers import ContactSerializer
import requests

def home(request):
    return render(request, 'index.html')

def dashboard(request):
    username = 'anshikajoshi07'
    url = f'https://api.github.com/users/{username}/repos'
    response = requests.get(url)
    repos = response.json() if response.status_code == 200 else []
    
    total_repos = len(repos)
    repo_list = [{'name': repo['name'], 'url': repo['html_url'], 'language': repo['language']} for repo in repos]
    
    language_count = {}
    for repo in repos:
        lang = repo['language']
        if lang:
            language_count[lang] = language_count.get(lang, 0) + 1
    
    most_used_lang = max(language_count, key=language_count.get) if language_count else None
    
    context = {
        'total_repos': total_repos,
        'repo_list': repo_list,
        'language_count': language_count,
        'most_used_lang': most_used_lang,
    }
    return render(request, 'dashboard.html', context)

@api_view(['POST'])
def contact_view(request):
    if request.method == 'POST':
        serializer = ContactSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
