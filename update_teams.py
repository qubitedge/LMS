import csv
import json

data = """Domain,Team Name,Project name,Selected students,Email,College name,Mentor,Whatsapp Group
Data Analytics,Spartans,E-Commerce Customer Analysis,Prathiba rachel rapaka,rachelrapaka@gmail.com,Andhra University,M Satish Kumar,https://chat.whatsapp.com/DkvB5Zb0An00qi4ldYoQ6b
,,,TERAPALLI JACINTH,tjacinth7@gmail.com,ANDHRA UNIVERSITY,M Satish Kumar,
,,,Chinta Sam Prasad,chintasam43@gmail.com,Maharaj Vijayaram Gajapathi Raj College of Engineering,M Satish Kumar,
,,,Boggavarapu Sri Vishnuvardhan,srivishnuboggavarapu@gmail.com,Raghu Engineering College,M Satish Kumar,
,,,Manthi Radha Krishna ,radhakrishnamanthi@gmail.com,,M Satish Kumar,
,,,Penumatsa Spandana,spandanapnmts@gmail.com,Visakha Institute of Engineering and Technology,M Satish Kumar,
Data Analytics,Titans,IPL Match Statistics Analysis,TADI SURYA ESWAR REDDY,suryathe63@gmail.com,Avanthi Institute of Engineering and Technology,A Tharun Kumar,https://chat.whatsapp.com/Dfnx2DIz8qA38digKz6Ya4
,,,KARRI HEMAKIRAN,khemakiran24@gmail.com,Avanthi Institute of Engineering and Technology,A Tharun Kumar,
,,,SOMBHATLA HANITH,hanithsombhatla2006@gmail.com,Avanthi Institute of Engineering and Technology,A Tharun Kumar,
,,,PRATHAPARAO NITHEESH KUMAR,niteeshkumarprataparao@gmail.com,Avanthi Institute of Engineering and Technology,A Tharun Kumar,
,,,SANIVADA YOGESWAR,yogi135999@gmail.com,Avanthi Institute of Engineering and Technology,A Tharun Kumar,
AI/ML,Legacy,Vehicle Number Plate Detection.pdf,Surada Swetha Madhu,suradaswethamadhu@gmail.com,Andhra University,M Likhith Kumar,https://chat.whatsapp.com/E4gswnieEw06yTflIngfxZ
,,,KONADA RASHMITHA,k.rashmitha2023@gmail.com,Lendi Institute of Engineering and Technology,M Likhith Kumar,
,,,Guntuku Abhishek Sai,scs634959@gmail.com,Lendi Institute of Engineering and Technology,M Likhith Kumar,
,,,Manepalli Poornima Sri Sarvani,poornimasarvani@gmail.com,Ramachandra College of Engineering,M Likhith Kumar,
,,,PANDI PRABHAVATHI,pandiprabhavathi67@gmail.com,Ramachandra College of Engineering,M Likhith Kumar,
,,,Kambhampati Sruthi,kambhampatisruthi@gmail.com,Ramachandra College of Engineering,M Likhith Kumar,
AI/ML,Knights,Credit Card Fraud Detection.pdf,Davaleswarapu V N S Ashrita,ashu26062006@gmail.com,Raghu Engineering College,Dr Kanthi Kiran,https://chat.whatsapp.com/C0oGvScU4kZ7PQsgSRIVBb
,,,BODAPATI VENKAT RAO,gorantlavenkat312@gmail.com,Raghu Engineering College,Dr Kanthi Kiran,
,,,Tutika Neeraja,neerajatutika04@gmail.com,ANDHRA UNIVERSITY,Dr Kanthi Kiran,
,,,Challa Hari Krishna,chharikrishna9390@gmail.com,Raghu Engineering College,Dr Kanthi Kiran,
,,,PITTA GAGAN KUMAR,23981a05n0@raghuenggcollege.in,Raghu Engineering College,Dr Kanthi Kiran,
,,,Somepalli Madhuri,smadhuri7186@gmail.com,Raghu Engineering College,Dr Kanthi Kiran,
,,,Kuriti Rohith,rohithkuritirohith2006@gmail.com,Raghu Engineering College,Dr Kanthi Kiran,
AI/ML,Kinetics,Disease Prediction & Patient Profiling System.pdf,Manukonda Sridhar,24985a0534@raghuenggcollege.in,Raghu Engineering College,Dr Kanthi Kiran,https://chat.whatsapp.com/JadjqrCUmw4BZwm4V4ytYx
,,,PITHANA ARUNA SHANMUKHI,arunashanmukhi8@gmail.com,Avanthi Institute of Engineering and Technology,Dr Kanthi Kiran,
,,,REGA CHANDU NIVAS,chandunivas11@gmail.com,Avanthi Institute of Engineering and Technology,Dr Kanthi Kiran,
,,,RAJANA KAVYA,kavyarajana10a@gmail.com,Avanthi Institute of Engineering and Technology,Dr Kanthi Kiran,
,,,MORAM CHAITHANYA,chaitanyamoram123@gmail.com,Avanthi Institute of Engineering and Technology,Dr Kanthi Kiran,
,,,SOUDU LIKHITHA,likhithasoudu10a@gmail.com,Avanthi Institute of Engineering and Technology,Dr Kanthi Kiran,
,,,SEERAM SATHWIKA,seeramsathwika@gmail.com,Avanthi Institute of Engineering and Technology,Dr Kanthi Kiran,
,,,PADALA SAGAR,sagarpadala777@gmail.com,Avanthi Institute of Engineering and Technology,Dr Kanthi Kiran,
AI/ML,Pheonix,Skin Cancer Detection.pdf,Ghanta Rudrani Sai,gckala06@gmail.com,Chaitanya Engineering College,K Pravallika,https://chat.whatsapp.com/Hqzz0zzUJnqANOdtfGOzum
,,,Ghanta Ruthvika Sai,c886813@gmail.com,Chaitanya Engineering College,K Pravallika,
,,,Swamisetty Durga Shivani,shivangisetty7@gmail.com,Chaitanya Engineering College,K Pravallika,
,,,G BHUMIKA,ganisettibhumika@gmail.com,Chaitanya Engineering College,K Pravallika,
,,,Nalluri Sarath Chandrika,sarathchandrikanalluri@gmail.com,Chaitanya Engineering College,K Pravallika,
,,,Bandaru Sahasra Tejaswini,bandarusahasra96@gmail.com,Chaitanya Engineering College,K Pravallika,
,,,B JHANSY,bammidijhansi8@gmail.com,Chaitanya Engineering College,K Pravallika,
Python,Thunder,Inventory management,K SAILAJA,sailuuu1221@gmail.com,Chaitanya Engineering College,A Tharun Kumar,https://chat.whatsapp.com/Fr6szbKdJjlIfHx4SfzTYA
,,,BANDARU RAVI TEJA,teja48740@gmail.com,Avanthi Institute of Engineering and Technology,A Tharun Kumar,
,,,KARRI APPALANAIDU,appalanaidukarri2005@gmail.com,Avanthi Institute of Engineering and Technology,A Tharun Kumar,
,,,KODA VASUNDHARA,kodavasundhara88@gmail.com,Avanthi Institute of Engineering and Technology,A Tharun Kumar,
,,,DWARAPUREDDI SIRISHA,siridwarapureddy2006@gmail.com,Avanthi Institute of Engineering and Technology,A Tharun Kumar,
,,,BALLA YAMUNA,yamunaballa033@gmail.com,Avanthi Institute of Engineering and Technology,A Tharun Kumar,
,,,ROUTHU BHAVYA SRI,bhavyasrirouthu4444@gmail.com,Avanthi Institute of Engineering and Technology,A Tharun Kumar,
,,,MAJJI RAMYA,ramyamajji2006@gmail.com,Avanthi Institute of Engineering and Technology,A Tharun Kumar,
,,,VANGALA UDHAY SAGAR,udhaysagar.vangala@gmail.com,Avanthi Institute of Engineering and Technology,A Tharun Kumar,
Python,Strikers,Hospital appointment system,TALLURI SARAH SHIREEN,sarahshireent@gmail.com,ANDHRA UNIVERSITY,M Satish Kumar,https://chat.whatsapp.com/GtzHYewpEK92iIYqiTKGEN
,,,ADARI VENKAT JAYANTH,venkatjayanth593@gmail.com,Chaitanya Engineering College,M Satish Kumar,
,,,Vadama Abhishek Varma,abhishekvarmaa55@gmail.com,JNTU GV Vizianagaram,M Satish Kumar,
,,,DOGGA KIRAN KUMAR,kirandogga038@gmail.com,Chaitanya Engineering College,M Satish Kumar,
,,,R BHARGAVI,bhaggireddi@gmail.com,Chaitanya Engineering College,M Satish Kumar,
,,,MARADANA VARSHINI,varshinimaradana@gmail.com,Chaitanya Engineering College,M Satish Kumar,
,,,MITHIREDDY VARSHINI,varshinimithireddy@gmail.com,Chaitanya Engineering College,M Satish Kumar,
,,,K V N S R KRISHNA KOUSHIK,kvnramakrishnakoushik@gmail.com,Chaitanya Engineering College,M Satish Kumar,
,,,Kintala Devika,kintaladevika@gmail.com,Chaitanya Engineering College,M Satish Kumar,
,,,MUSKARLA MOWNIKA,mounikamuskarla@gmail.com,Chaitanya Engineering College,M Satish Kumar,"""

lines = data.strip().split('\n')

current_team = None
current_project = None
current_whatsapp = None
current_mentor = None

students = []

for line in lines[1:]:
    parts = line.split(',')
    
    domain = parts[0]
    team_name = parts[1]
    project_name = parts[2]
    student_name = parts[3]
    email = parts[4].strip()
    college = parts[5]
    mentor = parts[6]
    whatsapp = parts[7] if len(parts) > 7 else ""
    
    if team_name:
        current_team = team_name
    if project_name:
        current_project = project_name
    if whatsapp:
        current_whatsapp = whatsapp
    if mentor:
        current_mentor = mentor
        
    project_clean = current_project.replace('.pdf', '') if current_project else ''
        
    students.append({
        "email": email,
        "studentName": student_name,
        "projectName": project_clean,
        "mentorName": current_mentor,
        "collegeName": college,
        "teamName": current_team,
        "whatsappLink": current_whatsapp
    })

from collections import defaultdict
teams = defaultdict(list)
for s in students:
    teams[s['teamName']].append(s['studentName'])

for s in students:
    s['teamMembers'] = [m for m in teams[s['teamName']] if m != s['studentName']]

with open('src/lib/capstone-teams.json', 'w') as f:
    json.dump(students, f, indent=2)
