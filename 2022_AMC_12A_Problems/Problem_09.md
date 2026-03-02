# 2022 AMC 12A Problem 9

> This problem is the same as [2022 AMC 10A #12](https://artofproblemsolving.com/wiki/index.php/2022_AMC_10A_Problems/Problem_12) and [2022 AMC 12A #9](https://artofproblemsolving.com/wiki/index.php/2022_AMC_12A_Problems/Problem_9).
## Problem
On Halloween $31$ children walked into the principal's office asking for candy. They
can be classified into three types: Some always lie; some always tell the truth; and
some alternately lie and tell the truth. The alternaters arbitrarily choose their first
response, either a lie or the truth, but each subsequent statement has the opposite
truth value from its predecessor. The principal asked everyone the same three
questions in this order.

"Are you a truth-teller?" The principal gave a piece of candy to each of the $22$
children who answered yes.

"Are you an alternater?" The principal gave a piece of candy to each of the $15$
children who answered yes.

"Are you a liar?" The principal gave a piece of candy to each of the $9$ children who
answered yes.

How many pieces of candy in all did the principal give to the children who always
tell the truth?

$\textbf{(A) } 7 \qquad \textbf{(B) } 12 \qquad \textbf{(C) } 21 \qquad \textbf{(D) } 27 \qquad \textbf{(E) } 31$
## Solution 1
Note that:

- Truth-tellers would answer yes-no-no to the three questions in this order.

- Liars would answer yes-yes-no to the three questions in this order.

- Alternaters who responded truth-lie-truth would answer no-no-no to the three questions in this order.

- Alternaters who responded lie-truth-lie would answer yes-yes-yes to the three questions in this order.

Suppose that there are $T$ truth-tellers, $L$ liars, and $A$ alternaters who responded lie-truth-lie.

The conditions of the first two questions imply that


$$\begin{align*}
T+L+A&=22, \\
L+A&=15.
$\end{align*}$$$


Subtracting the second equation from the first, we have $T=22-15=\boxed{\textbf{(A) } 7}.$

<u><b>Remark</b></u>

The condition of the third question is extraneous. However, we know that $A=9$ and $L=6,$ so there are $9$ alternaters who responded lie-truth-lie, $6$ liars, and $9$ alternaters who responded truth-lie-truth from this condition.

*~sigma ~[orenbad](https://artofproblemsolving.com/wiki/index.php/OrenSH) ~MRENTHUSIASM*
## Solution 2
Consider when the principal asks "Are you a liar?": The truth tellers truthfully say no, and the liars lie and say no. This leaves only alternaters who lie on this question to answer yes. Thus, all $9$ children that answered yes are alternaters that falsely answer Questions 1 and 3, and truthfully answer Question 2. The rest of the alternaters, however many there are, have the opposite behavior.

Consider the second question, "Are you an alternater?": The truth tellers again answer no, the liars falsely answer yes, and alternaters that truthfully answer also say yes. From the previous part, we know that $9$ alternaters truthfully answer here. Because only liars and $9$ alternaters answer yes, we can deduce that there are $15-9=6$ liars.

Consider the first question, "Are you a truth teller?": Truth tellers say yes, liars also say yes, and alternaters that lie on this question also say yes. From the first part, we know that $9$ alternaters lie here. From the previous part, we know that there are $6$ liars. Because only the number of truth tellers is unknown here, we can deduce that there are $22-9-6=7$ truth tellers.

The final question is how many pieces of candy did the principal give to truth tellers. Because truth tellers answer yes on only the first question, we know that all $7$ of them said yes once, resulting in $\boxed{\textbf{(A) } 7}$ pieces of candy.

*~phuang1024*
## Remark (Fake Solve)
This problem is broken in an interesting way that helps the test-taker. Since the true answers alternate for alternaters, you can still get the correct answer if you misinterpret the problem as "alternaters alternate their yes/no answers, but not their truth values". Suppose that $A$ alternaters answer yes-no-yes, and $A'$ alternaters answer no-yes-no. You still get $A=A'=9$.

In addition, you can even get the correct answer with the misinterpretation "alternaters have two types: alternaters of the same type give the same arbitrary answers to the three questions, and alternaters of different types give the opposite arbitrary answers to the three questions".

It's also notable that the misinterpretation makes the problem harder, so that the solution actually relies on all the information. This suggests that the question-writer may have been mistaken but got lucky.

*~oinava, based on demonstration of misinterpretation fakesolve by ~[orenbad](https://artofproblemsolving.com/wiki/index.php/OrenSH)*
## Video Solution 1 (One Key Observation)
https://youtu.be/9IQRgWn4NAk

*~Education, the Study of Everything*
## Video Solution 2 (Let's first understand the question)
https://youtu.be/7yAh4MtJ8a8?si=_jfMzsAiHgAGJ1uo&t=1552

*~Math-X*
## Video Solution 3
https://youtu.be/ZSwg-xKAQiM
## Video Solution by TheBeautyofMath
https://youtu.be/0kkc4-y8TkU?t=254

*~IceMatrix*
## See Also
