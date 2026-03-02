# 2014 AMC 12A Problem 4

> This problem is the same as [2014 AMC 12A #4](https://artofproblemsolving.com/wiki/index.php/2014_AMC_12A_Problems) and [2014 AMC 10A #6](https://artofproblemsolving.com/wiki/index.php/2014_AMC_10A_Problems).
## Problem
Suppose that $a$ cows give $b$ gallons of milk in $c$ days. At this rate, how many gallons of milk will $d$ cows give in $e$ days?

$\textbf{(A)}\ \frac{bde}{ac}\qquad\textbf{(B)}\ \frac{ac}{bde}\qquad\textbf{(C)}\ \frac{abde}{c}\qquad\textbf{(D)}\ \frac{bcde}{a}\qquad\textbf{(E)}\ \frac{abc}{de}$
## Solution 1
We need to multiply $b$ by $\frac{d}{a}$ for the new cows and $\frac{e}{c}$ for the new time, so the answer is $b\cdot \frac{d}{a}\cdot \frac{e}{c}=\frac{bde}{ac}$, or $\boxed{\textbf{(A) } \frac{bde}{ac}}$.
## Solution 2
We plug in $a=2, b=3, c=4, d=5$, and $e=6$. Hence the question becomes "2 cows give 3 gallons of milk in 4 days. How many gallons of milk do 5 cows give in 6 days?"

If 2 cows give 3 gallons of milk in 4 days, then 2 cows give $\frac{3}{4}$ gallons of milk in 1 day, so 1 cow gives $\frac{3}{4\cdot2}$ gallons in 1 day. This means that 5 cows give $\frac{5\cdot3}{4\cdot2}$ gallons of milk in 1 day. Finally, we see that 5 cows give $\frac{5\cdot3\cdot6}{4\cdot2}$ gallons of milk in 6 days. Substituting our values for the variables, this becomes $\frac{dbe}{ac}$, which is $\boxed{\textbf{(A)}\ \frac{bde}{ac}}$.
## Solution 3
We see that the number of cows is inversely proportional to the number of days and directly proportional to the gallons of milk. So our constant is $\dfrac{ac}{b}$.

Let $g$ be the answer to the question. We have $\dfrac{de}{g}=\dfrac{ac}{b}\implies gac=bde\implies \dfrac{bde}{ac}\implies\boxed{ \textbf{(A)}\ \frac{bde}{ac}}$
## Solution 4
The problem specifics "rate," so it would be wise to first find the rate at which cows produce milk. We can find the rate of work/production by finding the gallons produced by a single cow in a single day. To do this, we divide the amount produced by the number of cows and number of days

$$\implies\text{rate}=\dfrac{b}{ac}$$


Now that we have the gallons produced by a single cow in a single day, we simply multiply that rate by the number of cows and the number of days

$$\implies\boxed{\textbf{(A) } \dfrac{bde}{ac}}$$
## Solution 5
If $a$ cows give $b$ gallons of milk in $c$ days, that means that one cow will give $\frac{b}{a}$ gallons of milk in $c$ days. Also, we want to find the number of gallons of milk will $d$ cows give in $e$ days, so in $\frac{e}{c}$ days $d$ cows give $\frac{bd}{a}$ gallons of milk. Multiplying with the formula $d=rt$, we get $\boxed{\textbf{(A) } \dfrac{bde}{ac}}$
## Solution 6
In the right formula, plugging in $d=a$ and $e=c$ should simplify to $b$, as if it doesn't, we'd essentially be saying "$a$ cows give $b$ gallons of milk in $c$ days, but $a$ cows don't give $b$ gallons of milk in $c$ days." The only one of the answer choices that simplifies like this is $\boxed{\textbf{(A)}}$
## Solution 7
Call the rate at which a single cow produces milk $r$. Using the given information we get that $rac=b$, and we want to find $rde$. We solve for $r$ in the first equation to get $r=b \cdot \tfrac{1}{ac}$. Plugging in this value for $r$ into the expression we want, we get that $rde=\frac{bde}{ac}$, or $\boxed{\textbf{(A)}}$.
## Video Solution (CREATIVE THINKING)
https://youtu.be/4THtSkiSGMg

*~Education, the Study of Everything*
## Video Solution
https://youtu.be/OW4rHUTPgPA

*~savannahsolver*
## See Also
