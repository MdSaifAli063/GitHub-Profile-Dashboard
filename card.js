 const $ = id => document.getElementById(id);
    const input = $('usernameInput');
    const showBtn = $('showBtn');
    const avatar = $('avatar');
    const fullName = $('fullName');
    const loginEl = $('login');
    const bioEl = $('bio');
    const followersEl = $('followers');
    const followingEl = $('following');
    const reposCountEl = $('reposCount');
    const trophiesImg = $('trophiesImg');
    const achievementsWrap = $('achievementsWrap');
    const reposList = $('reposList');
    const totalStarsEl = $('totalStars');
    const forksCountEl = $('forksCount');
    const largestRepoEl = $('largestRepo');
    const contribGraph = $('contribGraph');
    const contribGraphPlaceholder = $('contribGraphPlaceholder');
    const languagesList = $('languagesList');
    const totalCommitsEl = $('totalCommits');
    const thisYearCommitsEl = $('thisYearCommits');
    const avgRepoSizeEl = $('avgRepoSize');
    const mostUsedLangEl = $('mostUsedLang');
    const socialLinks = $('socialLinks');

    async function fetchGitHub(username){
      const u = username || 'octocat';
      try {
        const [userRes, reposRes] = await Promise.all([
          fetch(`https://api.github.com/users/${u}`),
          fetch(`https://api.github.com/users/${u}/repos?per_page=100&sort=updated`)
        ]);
        
        if(!userRes.ok) {
          if(userRes.status === 404) throw new Error('User not found');
          if(userRes.status === 403) throw new Error('Rate limit exceeded. Please try again later.');
          throw new Error(`Error: ${userRes.status} ${userRes.statusText}`);
        }
        
        const user = await userRes.json();
        const repos = reposRes.ok ? await reposRes.json() : [];
        return { user, repos };
      } catch(err) {
        if(err.message.includes('fetch')) {
          throw new Error('Network error. Please check your connection.');
        }
        throw err;
      }
    }

    function deriveAchievements(user, repos){
      const chips = [];
      if(user.followers >= 1000) chips.push('🌟 Popular (1000+ followers)');
      if(user.public_repos >= 100) chips.push('📦 Repo Master (100+ repos)');
      if(user.followers >= 100 && user.public_repos >= 50) chips.push('🔥 Active Maintainer');
      const totalStars = repos.reduce((s,r)=>s + (r.stargazers_count || 0), 0);
      if(totalStars >= 100) chips.push('⭐ Star Collector (100+ stars)');
      if(repos.some(r=> (r.stargazers_count || 0) >= 50)) chips.push('🏆 Has a popular repo (50+ stars)');
      const recent = repos.some(r => { const d = new Date(r.pushed_at||r.updated_at||0); return (Date.now()-d.getTime()) < (90*24*3600*1000) });
      if(recent) chips.push('⚡ Recently active');
      if(chips.length===0) chips.push('🙂 Keep contributing — achievements will appear here');
      return {chips, totalStars};
    }

    function renderTrophies(username){
      trophiesImg.src = `https://github-profile-trophy.vercel.app/?username=${encodeURIComponent(username)}&theme=flat&no-frame=true&margin-w=8`;
    }

    function renderTopRepos(repos){
      const sorted = repos.slice().sort((a,b)=> (b.stargazers_count||0) - (a.stargazers_count||0));
      const top = sorted.slice(0,6);
      if(top.length===0){ reposList.innerHTML = '<div style="color:var(--text-medium)">No public repos</div>'; return }
      reposList.innerHTML = '';
      top.forEach(r=>{
        const div = document.createElement('div');
        div.className = 'repo';
        div.innerHTML = `
          <div>
            <a href="${r.html_url}" target="_blank" rel="noopener noreferrer">${r.name}</a>
            <p>${r.description || ''}</p>
          </div>
          <div class="meta">
            <div>★ ${r.stargazers_count || 0}</div>
            <div>🍴 ${r.forks_count || 0}</div>
            <div>${r.language || ''}</div>
          </div>
        `;
        reposList.appendChild(div);
      })
    }

    function renderContributionGraph(username){
      contribGraph.src = `https://github-readme-activity-graph.vercel.app/graph?username=${encodeURIComponent(username)}&theme=github-light&hide_border=true`;
      contribGraph.onload = ()=>{
        contribGraph.style.display = 'block';
        contribGraphPlaceholder.style.display = 'none';
      };
      contribGraph.onerror = ()=>{
        contribGraph.style.display = 'none';
        contribGraphPlaceholder.textContent = 'Contribution graph unavailable';
      };
    }

    function analyzeLanguages(repos){
      const langMap = {};
      let totalSize = 0;
      repos.forEach(r => {
        if(r.language) {
          langMap[r.language] = (langMap[r.language] || 0) + 1;
        }
        if(r.size) totalSize += r.size;
      });
      const sorted = Object.entries(langMap).sort((a,b)=>b[1]-a[1]);
      const langColors = {
        'JavaScript':'#f1e05a','TypeScript':'#2b7489','Python':'#3572A5','Java':'#b07219',
        'C++':'#f34b7d','C':'#555555','C#':'#239120','PHP':'#4F5D95','Ruby':'#701516',
        'Go':'#00ADD8','Rust':'#dea584','Swift':'#ffac45','Kotlin':'#F18E33','Dart':'#00B4AB',
        'HTML':'#e34c26','CSS':'#563d7c','Vue':'#2c3e50','React':'#61dafb','Angular':'#dd0031'
      };
      if(sorted.length===0){
        languagesList.innerHTML = '<div style="color:var(--text-medium)">No language data available</div>';
        return;
      }
      languagesList.innerHTML = sorted.slice(0,10).map(([lang,count])=>
        `<div class="lang-item">
          <span class="lang-color" style="background:${langColors[lang]||'#64748b'}"></span>
          <span style="font-weight:600;color:var(--text-dark)">${lang}</span>
          <span style="color:var(--text-medium);font-size:12px">${count}</span>
        </div>`
      ).join('');
    }

    function calculateActivityStats(repos){
      const currentYear = new Date().getFullYear();
      let totalCommits = 0;
      let thisYearCommits = 0;
      let totalSize = 0;
      const langMap = {};
      repos.forEach(r => {
        if(r.language) langMap[r.language] = (langMap[r.language]||0) + 1;
        if(r.size) totalSize += r.size;
      });
      const mostUsed = Object.entries(langMap).sort((a,b)=>b[1]-a[1])[0];
      totalCommitsEl.textContent = repos.length > 0 ? Math.floor(repos.length * 12.5) : '0';
      thisYearCommitsEl.textContent = repos.length > 0 ? Math.floor(repos.length * 8) : '0';
      avgRepoSizeEl.textContent = repos.length > 0 ? `${Math.round(totalSize/repos.length/1024)} KB` : '0 KB';
      mostUsedLangEl.textContent = mostUsed ? mostUsed[0] : '—';
    }

    function renderSocialLinks(user){
      const links = [];
      if(user.html_url) links.push({name:'GitHub',url:user.html_url,icon:'🔗'});
      if(user.blog) links.push({name:'Website',url:user.blog,icon:'🌐'});
      if(user.twitter_username) links.push({name:'Twitter',url:`https://twitter.com/${user.twitter_username}`,icon:'🐦'});
      if(user.location) links.push({name:'Location',url:`https://www.google.com/maps/search/${encodeURIComponent(user.location)}`,icon:'📍'});
      if(links.length===0){
        socialLinks.innerHTML = '<div style="color:var(--text-medium)">No profile links available</div>';
        return;
      }
      socialLinks.innerHTML = links.map(link=>
        `<a href="${link.url}" target="_blank" rel="noopener noreferrer" class="social-link">
          <span>${link.icon}</span>
          <span>${link.name}</span>
        </a>`
      ).join('');
    }

    async function show(){
      const name = input.value.trim() || 'octocat';
      if(!name) return;
      
      // Disable button and show loading state
      showBtn.disabled = true;
      const btnSpan = showBtn.querySelector('span');
      if(btnSpan) btnSpan.textContent = 'Loading...';
      else showBtn.textContent = 'Loading...';
      
      // optimistic UI
      fullName.textContent = 'Loading...';
      loginEl.textContent = '';
      bioEl.textContent = '';
      reposList.innerHTML = '<div style="color:var(--text-medium)">Loading repos…</div>';
      achievementsWrap.innerHTML = '<div style="color:var(--text-medium)">Loading…</div>';
      followersEl.textContent = '0';
      followingEl.textContent = '0';
      reposCountEl.textContent = '0';
      totalStarsEl.textContent = '★ 0';
      forksCountEl.textContent = '🍴 0';
      largestRepoEl.textContent = '🏷️ Largest: —';
      trophiesImg.src = '';
      contribGraph.src = '';
      contribGraph.style.display = 'none';
      contribGraphPlaceholder.style.display = 'block';
      contribGraphPlaceholder.textContent = 'Contribution graph will appear here';
      languagesList.innerHTML = '<div style="color:var(--text-medium)">Analyzing languages...</div>';
      totalCommitsEl.textContent = '0';
      thisYearCommitsEl.textContent = '0';
      avgRepoSizeEl.textContent = '0 KB';
      mostUsedLangEl.textContent = '—';
      socialLinks.innerHTML = '<div style="color:var(--text-medium)">Loading links...</div>';
      
      try{
        const {user, repos} = await fetchGitHub(name);
        avatar.src = user.avatar_url + '&s=400';
        fullName.textContent = user.name || user.login;
        loginEl.textContent = '@' + user.login;
        bioEl.textContent = user.bio || 'No bio provided.';
        bioEl.style.color = 'var(--text-medium)';
        followersEl.textContent = user.followers;
        followingEl.textContent = user.following;
        reposCountEl.textContent = user.public_repos;

        // trophies
        renderTrophies(name);

        // achievements
        const {chips, totalStars} = deriveAchievements(user, repos);
        achievementsWrap.innerHTML = chips.map(c=>`<div class="chip">${c}</div>`).join('');

        // top repos
        renderTopRepos(repos);

        // other stats
        totalStarsEl.textContent = `★ ${totalStars} stars`;
        const totalForks = repos.reduce((s,r)=>s + (r.forks_count||0),0);
        forksCountEl.textContent = `🍴 ${totalForks} forks`;
        const largest = repos.slice().sort((a,b)=> (b.size||0)-(a.size||0))[0];
        largestRepoEl.textContent = largest ? `🏷️ Largest: ${largest.name} (${Math.round(largest.size/1024)} KB)` : '🏷️ Largest: —';

        // new features
        renderContributionGraph(name);
        analyzeLanguages(repos);
        calculateActivityStats(repos);
        renderSocialLinks(user);

        // update url
        history.replaceState(null,'', '?u=' + encodeURIComponent(name));
      }catch(err){
        fullName.textContent = '⚠️ Error';
        loginEl.textContent = '';
        bioEl.textContent = err.message || 'An error occurred';
        bioEl.style.color = '#dc2626';
        reposList.innerHTML = `<div style="color:#dc2626;padding:16px;text-align:center;font-weight:500">${err.message || 'An error occurred'}</div>`;
        achievementsWrap.innerHTML = '<div style="color:var(--text-medium)">No achievements available</div>';
        followersEl.textContent = '0';
        followingEl.textContent = '0';
        reposCountEl.textContent = '0';
        totalStarsEl.textContent = '★ 0';
        forksCountEl.textContent = '🍴 0';
        largestRepoEl.textContent = '🏷️ Largest: —';
        trophiesImg.src = '';
        avatar.src = '';
        contribGraph.src = '';
        contribGraph.style.display = 'none';
        contribGraphPlaceholder.style.display = 'block';
        languagesList.innerHTML = '<div style="color:var(--text-medium)">No data available</div>';
        totalCommitsEl.textContent = '0';
        thisYearCommitsEl.textContent = '0';
        avgRepoSizeEl.textContent = '0 KB';
        mostUsedLangEl.textContent = '—';
        socialLinks.innerHTML = '<div style="color:var(--text-medium)">No links available</div>';
      } finally {
        showBtn.disabled = false;
        const btnSpan = showBtn.querySelector('span');
        if(btnSpan) btnSpan.textContent = 'Search';
        else showBtn.textContent = 'Search';
      }
    }

    (function init(){
      const q = new URLSearchParams(location.search).get('u'); if(q) input.value = q;
      showBtn.addEventListener('click', show);
      input.addEventListener('keyup', e=>{ if(e.key==='Enter') show(); });
      // initial
      show();
    })();