# 2024 AMC 12A Problem 9

> This problem is the same as [2024 AMC 10A #15](https://artofproblemsolving.com/wiki/index.php/2024_AMC_10A_Problems/Problem_15) and [2024 AMC 12A #9](https://artofproblemsolving.com/wiki/index.php/2024_AMC_12A_Problems/Problem_9).
## Problem
Let $M$ be the greatest integer such that both $M+1213$ and $M+3773$ are perfect squares. What is the units digit of $M$?

$\textbf{(A) }1\qquad\textbf{(B) }2\qquad\textbf{(C) }3\qquad\textbf{(D) }6\qquad\textbf{(E) }8$
## Solution 1
Let $M+1213=P^2$ and $M+3773=Q^2$ for some positive integers $P$ and $Q.$ We subtract the first equation from the second, then apply the difference of squares:

$$(Q+P)(Q-P)=2560.$$

 Note that $Q+P$ and $Q-P$ have the same parity, and $Q+P>Q-P.$

We wish to maximize both $P$ and $Q,$ so we maximize $Q+P$ and minimize $Q-P.$ It follows that


$$\begin{align*}
Q+P&=1280, \\
Q-P&=2,
$\end{align*}$$$


from which $(P,Q)=(639,641).$

Finally, we get $M=P^2-1213=Q^2-3773\equiv1-3\equiv8\pmod{10},$ so the units digit of $M$ is $\boxed{\textbf{(E) }8}.$

*~MRENTHUSIASM*

*~Tacos_are_yummy_1*

*~minor edit*
## Solution 2
Ideally, we would like for the two squares to be as close as possible. The best case is that they are consecutive squares (no square numbers in between them); however, since $M+1213$ and $M+3773$ (and thus their square roots) have the same parity, they cannot be consecutive squares (which are always opposite parities). The best we can do is that $M+1213$ and $M+3773$ have one square in between them.

Let the square between $M+1213$ and $M+3773$ be $x^2$. So, we have $M+1213 = (x-1)^2$ and $M+3773 = (x+1)^2$. Subtracting the two, we have $(M+3773)-(M+1213) = (x+1)^2 - (x-1)^2$, which yields $2560 = 4x$, which leads to $x = 640$. Therefore, the two squares are $639^2$ and $641^2$, which both have units digit $1$. Since both $1213$ and $3773$ have units digit $3$, $M$ will have units digit $\boxed{\textbf{(E) }8}$.

~$i_am_suk_at_math_2$ (parity argument editing by Technodoggo)
## Solution 3
Let $M+1213=$N^2 $\Rightarrow M+3773=(N+a)^2$

It is obvious that $a\neq1$ by parity

Thus, the minimum value of $a$ is 2
Which gives us,


$$(N+a)^2-N^2=M+3773-(M+1213)$$


$$4N+4=2560$$


$$N=639$$


Plugging this back in,


$$M=N^2-1213 \space \mod \space 10$$


$$M=8 \space \mod \space 10$$


Hence the answer $\boxed{\textbf{(E) }8}$.

*~lptoggled*

- trevian1(minor edit)
## Solution 4
Let $M+1213=n^2$ and $M+3773=(n+1)^2$ for some positive integer $n$. We do this because, in order to maximize $M$, the perfect squares need to be as close to each other as possible. We find that this configuration doesn't work, as when we subtract the equations, we have $2n+1=2560$; impossible. Then we try $M+3773=(n+2)^2$. Now we would have $4n+4=2560$ which indeed works! $n=639$.

Finally, we get $M=n^2-1213$ so the units digit of $M$ is $\boxed{\textbf{(E) }8}.$

*~xHypotenuse*
## Note
We experiment with values of $M$ to find the reason for why $M$ is maximised when $M + 1213$ and $M + 3773$ are nearly consecutive perfect squares. If $M$ is very small, $M + 1213$ and $M + 3773$ are perfect squares that are far apart. Yet, as $M$ grows, the relative distance between $M + 1213$ and $M + 3773$ decreases, so for very nearly consecutive perfect squares, $M$ is very large.

*~LeonQS*

(I don't know if this is trivial - when I first read the solutions, I was confused to why this was true. Maybe I didn't get enough sleep.)
## Video Solution (Fast! About 3 min solve!)
https://youtu.be/l3VrUsZkv8I

*~MC*
## Video Solution (4 min solve)
https://youtu.be/YgJ23mepN0Q

<i>~Education, the Study of Everything</i>
## Video Solution by Pi Academy
https://youtu.be/ABkKz0gS1MU?si=ZQBgDMRaJmMPSSMM
## Video Solution 1 by Power Solve
https://youtu.be/FvZVn0h3Yk4
## Video Solution by SpreadTheMathLove
https://youtu.be/CmIPAvwtWLA?si=ZCv3ypdDmCaV-aX3
## Video Solution by Dr. David
https://youtu.be/XLoetj5obYE
## Video solution by TheNeuralMathAcademy
https://www.youtube.com/watch?v=4b_YLnyegtw&t=2808s
