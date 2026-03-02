# 2015 AMC 12B Problem 21

## Problem
Cozy the Cat and Dash the Dog are going up a staircase with a certain number of steps. However, instead of walking up the steps one at a time, both Cozy and Dash jump. Cozy goes two steps up with each jump (though if necessary, he will just jump the last step). Dash goes five steps up with each jump (though if necessary, he will just jump the last steps if there are fewer than 5 steps left). Suppose that Dash takes 19 fewer jumps than Cozy to reach the top of the staircase. Let s denote the sum of all possible numbers of steps this staircase can have. What is the sum of the digits of s?

$\textbf{(A)}\; 9 \qquad\textbf{(B)}\; 11 \qquad\textbf{(C)}\; 12 \qquad\textbf{(D)}\; 13 \qquad\textbf{(E)}\; 15$
## Solution 1
We can translate this wordy problem into this simple equation:


$$\left\lceil \frac{s}{2} \right\rceil - 19 = \left\lceil \frac{s}{5} \right\rceil$$


We will proceed to solve this equation via casework.

Case 1: $\left\lceil \frac{s}{2} \right\rceil = \frac{s}{2}$

Our equation becomes $\frac{s}{2} - 19 = \frac{s}{5} + \frac{j}{5},$ where j $\in\{0,1,2,3,4\}$ Using the fact that s is an integer, we quickly find that $j=1$ and $j=4$ yield $s=64$ and $s=66$, respectively.

Case 2: $\left\lceil \frac{s}{2} \right\rceil = \frac{s}{2}+\frac{1}{2}$

Our equation becomes $\frac{s}{2} +\frac{1}{2} - 19 = \frac{s}{5} + \frac{j}{5},$ where j $\in\{0,1,2,3,4\}$ Using the fact that s is an integer, we quickly find that $j=2$ yields $s=63$.

Summing up we get $63+64+66=193$. The sum of the digits is $\boxed{\textbf{(D)}\; 13}.$
## Solution 2
It can easily be seen that the problem can be expressed by the equation:

$$\left\lceil \frac{s}{2} \right\rceil - \left\lceil \frac{s}{5} \right\rceil = 19$$


However, because the ceiling function is difficult to work with, we can rewrite the previous equation as:

$\frac{s+a}{2} - \frac{s+b}{5} = 19$ Where a $\in\{0,1\}$ and b $\in\{0,1,2,3,4\}$ Multiplying both sides by ten and simplifying, we get:

$$
5s+5a-2s-2b=190
3s = 190+2b-5a
s = 63 + \frac{1+2b-5a}{3}
$$


Because s must be an integer, we need to find the values of a and b such that $2b-5a \equiv 2 \mod 3.$ We solve using casework.

Case 1: $a = 0$

If $a = 0$, we have $2b\equiv 2 \mod 3.$ We can easily see that $b = 1$ or $b = 4$, which when plugged into our original equation lead to $s = 64$ and $s=66$ respectively.

Case 2: $a = 1$

If $a = 1$, we have 2$b-5\equiv 2 \mod 3,$ which can be rewritten as $2b\equiv 1 \mod 3$ . We can again easily see that $b = 2$ is the only solution, which when plugged into our original equation lead to $s = 63$.

Adding these together we get $64+66+63=193$. The sum of the digits is $\boxed{\textbf{(D)}\; 13}.$
## Solution 3
As before, we write the equation:


$$\left\lceil \frac{s}{2} \right\rceil - 19 = \left\lceil \frac{s}{5} \right\rceil.$$


To get a ballpark estimate of where s might lie, we remove the ceiling functions to find:

$$\frac{s}{2} - 19 = \frac{s}{5}.$$

This gives $\frac{3s}{10} = 19,$ and thus values for s will be around $\frac{190}{3} = 63.\overline3.$

Now, to establish some bounds around this estimated working value, we note that if $s=60$, Cozy takes 30 steps while Dash takes 12, a difference of 18.  If $s=70$, Cozy takes 35 steps while Dash takes 14, a difference of 21.  When s increases from a multiple of ten, the difference will never decrease beyond what it is at the multiple of ten, and likewise, when it decreases, it never becomes greater than at the multiple of ten, so any working values of s will be between 60 and 70.

Then, by inspection, $s=63$, 64, or 66, so $\sums = 193\implies \boxed{\textbf{(D)}\; 13}.$
## Solution 4
Notice that the possible number of steps in the staircase is around 60 to 70. By testing all of the values between 60 and 70, we see that 63, 64 and 66 work. Adding those up gives 193, so the answer is $1+9+3=\boxed{\textbf{(D)}\; 13}.$
## Solution 5
We represent C's steps with $2c$ + a = n and D's steps with $5d$ + b = n, where a $\in\{1,2\}$ and b $\in\{1,2,3,4,5\}$, where n is the number of steps, c is the number of jumps C takes bar the last one, and d is the number of jumps D takes bar the last.
The reason for starting at 1 and ending at 5 instead of 0 through 4 is that the last step can be quite problematic to deal with, especially if it is possible to make it in one go, so we treat it as a different jump that can take all possible jump values. We know that D makes it in 19 fewer than C, so $c+1-(d+1) = 19 \impliesc = 19+d \implies 5d + b =2(19+d)$ + a $\implies 3$d = 38 + a - b.

Now that we have this nice equivalence, we can do the thing and it works.

If we take both sides mod 3 and rearrange, we get b $\equiv 2+a \pmod{3}$
This gives us the following satisfactory (a,b) relational pairs: $\{(1,3),(2,1),(2,4)\}$. We can now just find the corresponding d value for each pair, sum it all up using $5d$ + b = n and sum the digits to reveal $\boxed{\textbf{(D)}\; 13}$ as the answer.

~ $\color{magenta}$ zoomanTV
## Fake Solve(Less than 1 minute)
Jumping steps screams Fibonacci numbers, and 13 is the only Fibonacci Number here. Hence, the answer is $\boxed{\textbf{(D)}\; 13}.$

Note: Don't try this in an actual exam unless you're really desperate

*~athreyay*
## Video Solution
https://youtu.be/TpHZVbBGmVQ

*~IceMatrix*
## See Also
