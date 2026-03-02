# 2017 AMC 12A Problem 5

## Problem
At a gathering of 30 people, there are 20 people who all know each other and 10 people who know no one. People who know each other hug, and people who do not know each other shake hands. How many handshakes occur?

$\textbf{(A)}\ 240\qquad\textbf{(B)}\ 245\qquad\textbf{(C)}\ 290\qquad\textbf{(D)}\ 480\qquad\textbf{(E)}\ 490$
## Solution 1 (Basic)
All of the handshakes will involve at least one person from the 10 who knows no one.  Label these ten people A, B, C, D, E, F, G, H, I, J.

Person A from the group of 10 will initiate a handshake with everyone else (29 people).  Person B initiates 28 handshakes plus the one already counted from person A.  Person C initiates 27 new handshakes plus the two we already counted.  This continues until person J initiates 20 handshakes plus the nine we already counted from A ... I.

$$29+28+27+26+25+24+23+22+21+20 = \boxed{(B)=\ 245}$$
## Solution 2
Let the group of people who all know each other be A, and let the group of people who know no one be B. Handshakes occur between each pair (a,b) such that $a\in A$ and $b\in B,$ and between each pair of members in B. Thus, the answer is

$$|A||B|+{|B|\choose 2} = 20\cdot 10+{10\choose 2} = 200+45 = \boxed{(B)=\ 245}$$
## Solution 3 (Complementary Counting)
The number of handshakes will be equivalent to the difference between the number of total interactions and the number of hugs, which are  {$30\choose 2$} and {$20\choose 2$}, respectively. Thus, the total amount of handshakes  is {$30\choose 2} - {20\choose 2} = 435 - 190=\boxed{(B)=\ 245}$
## Solution 4
Each of the 10 people who do not know anybody will shake hands with all 20 of the people who do know each other. This means there will be at least 20 * 10 = 200 handshakes. In addition, those 10 people will also shake hands with each other, giving us another $9+8+7+6+5+4+3+2+1 = 45$ handshakes. Therefore, there is a total of $200+45 =\boxed{(B) = 245}$ handshakes.
## Solution 5
Every one of the 20 people who know each other will shake hands with each of the 10 people who know no one, so there are $20\cdot 10 = 200$ handshakes here. Each of the 10 people will also shake hands with each other, so there will be {10 $\choose 2$} =45 handshakes for this case. In total, there are 200+45 = $\boxed{\textbf{(B)}\ 245}$ handshakes.

*~Benedict T (countmath1)*
## Video Solution (HOW TO THINK CREATIVELY!!!)
https://youtu.be/TCxjwO-I8kQ

*~Education, the Study of Everything*
## Video Solution
https://www.youtube.com/watch?v=PRF4Co5txJI

*~Math4All999*
## See Also
