# 2014 AMC 12A Problem 5

> This problem is the same as [2014 AMC 12A #5](https://artofproblemsolving.com/wiki/index.php/2014_AMC_12A_Problems) and [2014 AMC 10A #5](https://artofproblemsolving.com/wiki/index.php/2014_AMC_10A_Problems).
## Problem
On an algebra quiz, $10\%$ of the students scored $70$ points, $35\%$ scored $80$ points, $30\%$ scored $90$ points, and the rest scored $100$ points. What is the difference between the mean and median score of the students' scores on this quiz?

$\textbf{(A)}\ 1\qquad\textbf{(B)}\ 2\qquad\textbf{(C)}\ 3\qquad\textbf{(D)}\ 4\qquad\textbf{(E)}\ 5$
## Solution 1
WLOG, let there be $20$ students (the least whole number possible) who took the test. We have $2$ students score $70$ points, $7$ students score $80$ points, $6$ students score $90$ points and $5$ students score $100$ points. Therefore, the mean
is $87$ and the median is $90$.

Thus, the solution is

$$90-87=3\implies\boxed{\textbf{(C)} \ 3}$$
## Solution 2
The percentage who scored $100$ points is $100\%-(10\%+35\%+30\%)=100\%-75\%=25\%$. Now, we need to find the median, which is the score that splits the upper and lower $50\%$.The lower $10\%+35\%=45\%$ scored $70$ or $80$ points, so the median is $90$ (since the upper $25\%$ is $100$ points and the lower $45\%$ is $70$ or $80$).The mean is $10\%\cdot70+35\%\cdot80+30\%\cdot90+25\%\cdot100=7+28+27+25=87$.
So, our solution is $\Rightarrow\boxed{3 \ \textbf{(C)} }$ ~sosiaops
## Solution 3
The $\le 80$-point scores make up $10\%+35\% = 45\% < 50\%$ of the scores, but the $\le 90$-point scores make up $45\%+30\% = 75\% > 50\%$ of the scores, so the median is $90$.

$10\%$ of scores were $70-90 = -20$ more than the median, $35\%$ were $-10$ more, $100\%-75\% = 25\%$ were $10$ more, and the rest were equal. This means that the mean score is $10\%\cdot(-20)+35\%\cdot(-10)+25\%\cdot10 = -2 + (-3.5) + 2.5 = -3$ more than the median, so their difference is $\left|-3\right| = \boxed{\textbf{(C)}\ 3}$.
*~emerald_block*
## Video Solution (CREATIVE THINKING)
https://youtu.be/OHF3WWRq0h4

*~Education, the Study of Everything*
## Video Solution
https://youtu.be/Oe-QLPIuTeY

*~savannahsolver*
## See Also
